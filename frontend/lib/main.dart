import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'services/continuum_guard.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => LoanWizardProvider()..init(),
      child: const LoanWizardApp(),
    ),
  );
}

class LoanWizardApp extends StatelessWidget {
  const LoanWizardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Continuum Engine - Loan Wizard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A), // Deep Navy
          brightness: Brightness.light,
        ),
      ),
      initialRoute: '/apply',
      routes: {
        '/apply': (context) => const LoanWizardHome(),
        '/login': (context) => const TelemetryLoginScreen(),
        '/dashboard': (context) => const TelemetryDashboardScreen(),
      },
    );
  }
}

class LoanWizardProvider extends ChangeNotifier {
  final ContinuumGuard guard = ContinuumGuard(backendUrl: "http://localhost:8000/api/v1");
  
  // App State
  String sessionToken = "";
  int currentStep = 1;
  final Map<String, String> formData = {};
  
  bool isLoading = true;
  bool isCrashing = false;
  String crashStatusMessage = "";
  String clientVersion = "1.0.0";

  // Operator Auth & Dashboard State
  String? operatorToken;
  Map<String, dynamic>? dashboardMetrics;
  List<dynamic>? telemetryLogs;
  bool isDashboardLoading = false;
  String dashboardError = "";
  
  // Controllers
  final Map<String, TextEditingController> controllers = {
    'fullName': TextEditingController(),
    'dateOfBirth': TextEditingController(),
    'email': TextEditingController(),
    'phoneNumber': TextEditingController(),
    'ssn': TextEditingController(),
    'employmentStatus': TextEditingController(text: 'Employed'),
    'annualIncome': TextEditingController(),
    'monthlyDebt': TextEditingController(),
    'loanAmount': TextEditingController(),
    'repaymentTerm': TextEditingController(text: '36'),
    'loanPurpose': TextEditingController(text: 'Debt Consolidation'),
    'consentChecked': TextEditingController(text: 'false'),
  };

  Future<void> init() async {
    isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();

    // Check query parameter for deep link state recovery
    final uriSessionToken = Uri.base.queryParameters['session_token'];
    if (uriSessionToken != null && uriSessionToken.isNotEmpty) {
      await prefs.setString("continuum_session_token", uriSessionToken);
      sessionToken = uriSessionToken;
      print("Deep-link session_token parameter found: $sessionToken");
    } else {
      sessionToken = await guard.getOrCreateSessionToken();
    }

    // Restore operator token if cached
    operatorToken = prefs.getString("continuum_operator_token");

    // Check version drift
    final driftResult = await guard.checkVersionDrift();
    if (driftResult["isDrifted"] == true) {
      clientVersion = driftResult["serverVersion"];
    }

    // Fetch or verify session JWT
    await guard.getOrCreateSessionJwt(sessionToken);

    // Try to rehydrate from backend
    final remoteSnapshot = await guard.rehydrateState(sessionToken);
    if (remoteSnapshot != null) {
      currentStep = remoteSnapshot["current_step"] ?? 1;
      final Map<String, dynamic> remoteData = remoteSnapshot["form_data"] ?? {};
      remoteData.forEach((key, value) {
        formData[key] = value.toString();
        if (controllers.containsKey(key)) {
          controllers[key]!.text = value.toString();
        }
      });
      print("State rehydrated from backend: Step $currentStep");
    } else {
      // Fallback: try local cache
      final localSnapshot = await guard.getLocalSnapshot();
      if (localSnapshot != null) {
        currentStep = localSnapshot["current_step"] ?? 1;
        final Map<String, dynamic> localData = localSnapshot["form_data"] ?? {};
        localData.forEach((key, value) {
          formData[key] = value.toString();
          if (controllers.containsKey(key)) {
            controllers[key]!.text = value.toString();
          }
        });
        print("State rehydrated from local cache: Step $currentStep");
      }
    }

    isLoading = false;
    notifyListeners();
  }

  void updateField(String field, String value) {
    formData[field] = value;
    controllers[field]?.text = value;
    // Debounce/autosave locally
    guard.saveLocalSnapshot(currentStep, formData);
  }

  Future<void> nextStep(GlobalKey<FormState> formKey) async {
    if (formKey.currentState?.validate() ?? false) {
      if (currentStep < 4) {
        currentStep++;
        await guard.saveLocalSnapshot(currentStep, formData);
        notifyListeners();
      }
    }
  }

  void prevStep() {
    if (currentStep > 1) {
      currentStep--;
      guard.saveLocalSnapshot(currentStep, formData);
      notifyListeners();
    }
  }

  Future<void> simulateCrashAndReload() async {
    isCrashing = true;
    crashStatusMessage = "Dynamic Asset Load: 404 Not Found (main.part.js missing)";
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 1200));

    crashStatusMessage = "StaleAssetBoundary: Capturing state snapshot...";
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 800));

    crashStatusMessage = "State Vault: Backing up form inputs to engine...";
    notifyListeners();
    
    // Perform state vaulting
    final success = await guard.vaultState(sessionToken, currentStep, formData);
    
    // Log crash telemetry
    await guard.logTelemetry(
      sessionToken: sessionToken,
      targetAssetUrl: "http://localhost:8000/assets/main.part.js",
      errorMessage: "ChunkLoadError: Loading chunk 3 failed (404 Stale Asset).",
      stackTrace: "Error: Loading chunk 3 failed.\n   at __webpack_require__.f.j\n   at main.dart.js:14250",
    );
    
    await Future.delayed(const Duration(milliseconds: 1000));
    crashStatusMessage = success 
        ? "Sync complete. Restarting application environment..." 
        : "Vault offline fallback cached locally. Reloading client...";
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 1000));

    // Reset app memory state (simulating hard page reload/update)
    currentStep = 1;
    formData.clear();
    for (var controller in controllers.values) {
      controller.clear();
    }
    controllers['employmentStatus']!.text = 'Employed';
    controllers['repaymentTerm']!.text = '36';
    controllers['loanPurpose']!.text = 'Debt Consolidation';
    controllers['consentChecked']!.text = 'false';
    
    clientVersion = "1.0.1"; // Upgraded version upon reload
    isCrashing = false;
    notifyListeners();

    // Rehydrate from backend
    await init();
  }

  Future<void> submitApplication() async {
    isLoading = true;
    notifyListeners();
    
    // Simulate API network submission delay
    await Future.delayed(const Duration(milliseconds: 1500));
    
    await guard.clearSession();
    currentStep = 1;
    formData.clear();
    for (var controller in controllers.values) {
      controller.clear();
    }
    
    isLoading = false;
    notifyListeners();
  }

  // Operator Auth Methods
  Future<bool> loginOperator(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse("${guard.backendUrl}/auth/login"),
        headers: {"Content-Type": "application/json"},
        body: json.encode({"username": username, "password": password}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        operatorToken = data["access_token"];
        if (operatorToken != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString("continuum_operator_token", operatorToken!);
          notifyListeners();
          return true;
        }
      }
    } catch (e) {
      print("Operator login failed: $e");
    }
    return false;
  }

  Future<void> logoutOperator() async {
    operatorToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("continuum_operator_token");
    notifyListeners();
  }

  // Dashboard Fetching Method
  Future<void> fetchDashboardData() async {
    if (operatorToken == null) return;
    isDashboardLoading = true;
    dashboardError = "";
    notifyListeners();

    try {
      final metricsResponse = await http.get(
        Uri.parse("${guard.backendUrl}/telemetry/metrics"),
        headers: {"Authorization": "Bearer $operatorToken"},
      );
      final logsResponse = await http.get(
        Uri.parse("${guard.backendUrl}/telemetry/logs"),
        headers: {"Authorization": "Bearer $operatorToken"},
      );

      if (metricsResponse.statusCode == 200 && logsResponse.statusCode == 200) {
        dashboardMetrics = json.decode(metricsResponse.body);
        telemetryLogs = json.decode(logsResponse.body);
      } else {
        dashboardError = "Failed to fetch telemetry data. Unauthorized or Server Error.";
      }
    } catch (e) {
      dashboardError = "Connection error: $e";
    } finally {
      isDashboardLoading = false;
      notifyListeners();
    }
  }
}

class LoanWizardHome extends StatelessWidget {
  const LoanWizardHome({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<LoanWizardProvider>(context);

    if (provider.isCrashing) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F172A), // Slate 900
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            key: const Key("crashOverlayKey"),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.report_problem_outlined,
                  color: Colors.amber,
                  size: 80,
                ),
                const SizedBox(height: 24),
                const Text(
                  "STALE CLIENT ASSET INTERCEPTED",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  provider.crashStatusMessage,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                const SizedBox(
                  width: 250,
                  child: LinearProgressIndicator(
                    color: Colors.blueAccent,
                    backgroundColor: Color(0xFF334155),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Standardized Restoring State Loader Card Overlay
    if (provider.isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF1F5F9), // Light Grey
        body: Center(
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(40.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(
                    color: Color(0xFF1E3A8A),
                  ),
                  const SizedBox(height: 24),
                    Text(
                      "Rehydrating your application... please wait.",
                      style: const TextStyle(
                        fontSize: 16,
                        color: Color(0xFF334155),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Light Grey
      appBar: AppBar(
        title: const Text(
          "Continuum Engine - Loan Wizard",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              "App: v${provider.clientVersion}",
              style: TextStyle(
                color: Colors.blue.shade800,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.dashboard_outlined, color: Color(0xFF1E3A8A)),
            tooltip: "Telemetry Operator Dashboard",
            onPressed: () {
              Navigator.pushNamed(context, '/dashboard');
            },
          ),
          const SizedBox(width: 8),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: const Icon(Icons.flash_on),
            label: const Text("Simulate Deploy 404 Crash"),
            onPressed: () => provider.simulateCrashAndReload(),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32.0, horizontal: 16.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Interactive Progress Steps indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(4, (index) {
                          final stepNum = index + 1;
                          final isActive = provider.currentStep == stepNum;
                          final isCompleted = provider.currentStep > stepNum;
                          return Expanded(
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: isCompleted
                                      ? Colors.green
                                      : (isActive ? Colors.blue.shade800 : Colors.grey.shade300),
                                  child: isCompleted
                                      ? const Icon(Icons.check, size: 18, color: Colors.white)
                                      : Text(
                                          "$stepNum",
                                          style: TextStyle(
                                            color: isActive || isCompleted ? Colors.white : Colors.black87,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                ),
                                if (index < 3)
                                  Expanded(
                                    child: Divider(
                                      thickness: 2,
                                      color: isCompleted ? Colors.green : Colors.grey.shade300,
                                    ),
                                  ),
                              ],
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 32),
                      // Active wizard form
                      LoanWizardForm(provider: provider),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class LoanWizardForm extends StatefulWidget {
  final LoanWizardProvider provider;
  const LoanWizardForm({super.key, required this.provider});

  @override
  State<LoanWizardForm> createState() => _LoanWizardFormState();
}

class _LoanWizardFormState extends State<LoanWizardForm> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    switch (widget.provider.currentStep) {
      case 1:
        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Step 1: Personal Information",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['fullName'],
                decoration: const InputDecoration(
                  labelText: "Full Name",
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? "Required" : null,
                onChanged: (val) => widget.provider.updateField('fullName', val),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['dateOfBirth'],
                decoration: const InputDecoration(
                  labelText: "Date of Birth (YYYY-MM-DD)",
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return "Required";
                  if (!RegExp(r"^\d{4}-\d{2}-\d{2}$").hasMatch(val)) return "Format must be YYYY-MM-DD";
                  return null;
                },
                onChanged: (val) => widget.provider.updateField('dateOfBirth', val),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['email'],
                decoration: const InputDecoration(
                  labelText: "Email Address",
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return "Required";
                  if (!val.contains("@")) return "Invalid email";
                  return null;
                },
                onChanged: (val) => widget.provider.updateField('email', val),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['phoneNumber'],
                decoration: const InputDecoration(
                  labelText: "Phone Number",
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? "Required" : null,
                onChanged: (val) => widget.provider.updateField('phoneNumber', val),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['ssn'],
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: "Social Security Number (SSN)",
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? "Required" : null,
                onChanged: (val) => widget.provider.updateField('ssn', val),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton(
                    onPressed: () => widget.provider.nextStep(_formKey),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade800,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text("Next"),
                  ),
                ],
              ),
            ],
          ),
        );
      case 2:
        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Step 2: Financial Details",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: widget.provider.controllers['employmentStatus']!.text.isEmpty
                    ? 'Employed'
                    : widget.provider.controllers['employmentStatus']!.text,
                decoration: const InputDecoration(
                  labelText: "Employment Status",
                  border: OutlineInputBorder(),
                ),
                items: ['Employed', 'Self-Employed', 'Unemployed', 'Retired'].map((String val) {
                  return DropdownMenuItem<String>(
                    value: val,
                    child: Text(val),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    widget.provider.updateField('employmentStatus', val);
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['annualIncome'],
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Annual Income (\$)",
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return "Required";
                  if (double.tryParse(val) == null) return "Must be a valid number";
                  return null;
                },
                onChanged: (val) => widget.provider.updateField('annualIncome', val),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['monthlyDebt'],
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Monthly Debt / Liabilities (\$)",
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return "Required";
                  if (double.tryParse(val) == null) return "Must be a valid number";
                  return null;
                },
                onChanged: (val) => widget.provider.updateField('monthlyDebt', val),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => widget.provider.prevStep(),
                    child: const Text("Back"),
                  ),
                  ElevatedButton(
                    onPressed: () => widget.provider.nextStep(_formKey),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade800,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text("Next"),
                  ),
                ],
              ),
            ],
          ),
        );
      case 3:
        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Step 3: Loan Options",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: widget.provider.controllers['loanAmount'],
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Loan Amount Requested (\$)",
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return "Required";
                  final amt = double.tryParse(val);
                  if (amt == null) return "Must be a valid number";
                  if (amt < 1000 || amt > 10000000) return "Range: \$1,000 - \$10,000,000";
                  return null;
                },
                onChanged: (val) => widget.provider.updateField('loanAmount', val),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: widget.provider.controllers['repaymentTerm']!.text.isEmpty
                    ? '36'
                    : widget.provider.controllers['repaymentTerm']!.text,
                decoration: const InputDecoration(
                  labelText: "Repayment Term (Months)",
                  border: OutlineInputBorder(),
                ),
                items: ['12', '24', '36', '48', '60'].map((String val) {
                  return DropdownMenuItem<String>(
                    value: val,
                    child: Text("$val Months"),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    widget.provider.updateField('repaymentTerm', val);
                  }
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: widget.provider.controllers['loanPurpose']!.text.isEmpty
                    ? 'Debt Consolidation'
                    : widget.provider.controllers['loanPurpose']!.text,
                decoration: const InputDecoration(
                  labelText: "Loan Purpose",
                  border: OutlineInputBorder(),
                ),
                items: ['Debt Consolidation', 'Home Improvement', 'Business', 'Other'].map((String val) {
                  return DropdownMenuItem<String>(
                    value: val,
                    child: Text(val),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    widget.provider.updateField('loanPurpose', val);
                  }
                },
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => widget.provider.prevStep(),
                    child: const Text("Back"),
                  ),
                  ElevatedButton(
                    onPressed: () => widget.provider.nextStep(_formKey),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade800,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text("Next"),
                  ),
                ],
              ),
            ],
          ),
        );
      case 4:
        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Step 4: Review & Submit",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSummaryRow("Full Name", widget.provider.formData['fullName'] ?? ''),
                    _buildSummaryRow("DOB", widget.provider.formData['dateOfBirth'] ?? ''),
                    _buildSummaryRow("Email", widget.provider.formData['email'] ?? ''),
                    _buildSummaryRow("Employment", widget.provider.formData['employmentStatus'] ?? 'Employed'),
                    _buildSummaryRow("Annual Income", "\$${widget.provider.formData['annualIncome'] ?? ''}"),
                    _buildSummaryRow("Loan Amount", "\$${widget.provider.formData['loanAmount'] ?? ''}"),
                    _buildSummaryRow("Repayment", "${widget.provider.formData['repaymentTerm'] ?? '36'} Months"),
                    _buildSummaryRow("Purpose", widget.provider.formData['loanPurpose'] ?? 'Debt Consolidation'),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              FormField<bool>(
                initialValue: widget.provider.controllers['consentChecked']!.text == 'true',
                validator: (val) => val != true ? "You must consent to continue" : null,
                builder: (formFieldState) {
                  return Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Checkbox(
                            value: formFieldState.value ?? false,
                            onChanged: (val) {
                              formFieldState.didChange(val);
                              widget.provider.updateField('consentChecked', val.toString());
                            },
                          ),
                          const Expanded(
                            child: Text(
                              "I confirm the accuracy of the provided information.",
                              style: TextStyle(fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                      if (formFieldState.hasError)
                        Padding(
                          padding: const EdgeInsets.only(left: 12.0),
                          child: Text(
                            formFieldState.errorText!,
                            style: const TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => widget.provider.prevStep(),
                    child: const Text("Back"),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState?.validate() ?? false) {
                        widget.provider.submitApplication().then((_) {
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text("Application Submitted"),
                              content: const Text("Your loan application has been successfully submitted."),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx),
                                  child: const Text("OK"),
                                )
                              ],
                            ),
                          );
                        });
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade700,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text("Submit Application"),
                  ),
                ],
              ),
            ],
          ),
        );
      default:
        return const Center(child: Text("Unknown Step"));
    }
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// Telemetry Login View Widget
class TelemetryLoginScreen extends StatefulWidget {
  const TelemetryLoginScreen({super.key});

  @override
  State<TelemetryLoginScreen> createState() => _TelemetryLoginScreenState();
}

class _TelemetryLoginScreenState extends State<TelemetryLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController(text: 'admin');
  final _passwordController = TextEditingController(text: 'password123');
  bool _isLoading = false;
  String _errorMessage = '';

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    final provider = Provider.of<LoanWizardProvider>(context, listen: false);
    final success = await provider.loginOperator(
      _usernameController.text,
      _passwordController.text,
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      if (success) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        setState(() {
          _errorMessage = 'Invalid operator username or password.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Slate 900
      appBar: AppBar(
        title: const Text("Operator Access Portal"),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacementNamed(context, '/apply'),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Card(
              color: const Color(0xFF1E293B), // Slate 800
              elevation: 8,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Center(
                        child: Icon(Icons.security, size: 64, color: Colors.blueAccent),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        "Continuum Engine",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const Text(
                        "Enter credentials to access metrics",
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      if (_errorMessage.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade900.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red.shade800),
                          ),
                          child: Text(
                            _errorMessage,
                            style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      TextFormField(
                        controller: _usernameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: "Username",
                          labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF475569)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent),
                          ),
                          prefixIcon: Icon(Icons.person, color: Color(0xFF94A3B8)),
                        ),
                        validator: (val) => val == null || val.trim().isEmpty ? "Required" : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: "Password",
                          labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF475569)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.blueAccent),
                          ),
                          prefixIcon: Icon(Icons.lock, color: Color(0xFF94A3B8)),
                        ),
                        validator: (val) => val == null || val.trim().isEmpty ? "Required" : null,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text("Access Dashboard", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Telemetry Dashboard Screen Widget (Dark, Glassmorphic feel)
class TelemetryDashboardScreen extends StatefulWidget {
  const TelemetryDashboardScreen({super.key});

  @override
  State<TelemetryDashboardScreen> createState() => _TelemetryDashboardScreenState();
}

class _TelemetryDashboardScreenState extends State<TelemetryDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<LoanWizardProvider>(context, listen: false);
      if (provider.operatorToken == null) {
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        provider.fetchDashboardData();
      }
    });
  }

  void _showStackTrace(String message, String? stackTrace) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(
          message,
          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Error Details:", style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(message, style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 16),
              const Text("Stack Trace:", style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Container(
                width: double.maxFinite,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Text(
                  stackTrace ?? "No stack trace available.",
                  style: const TextStyle(
                    color: Colors.redAccent,
                    fontFamily: 'Courier',
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Dismiss", style: TextStyle(color: Colors.white70)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<LoanWizardProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Slate 900
      appBar: AppBar(
        title: const Text("Telemetry Operator Dashboard"),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        elevation: 2,
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.arrow_back, color: Colors.blueAccent),
            label: const Text("Apply Wizard", style: TextStyle(color: Colors.blueAccent)),
            onPressed: () => Navigator.pushReplacementNamed(context, '/apply'),
          ),
          const SizedBox(width: 16),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade900,
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.logout),
            label: const Text("Logout"),
            onPressed: () {
              provider.logoutOperator().then((_) {
                Navigator.pushReplacementNamed(context, '/login');
              });
            },
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: provider.isDashboardLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.blueAccent))
          : provider.dashboardError.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
                      const SizedBox(height: 16),
                      Text(
                        provider.dashboardError,
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => provider.fetchDashboardData(),
                        child: const Text("Retry"),
                      )
                    ],
                  ),
                )
              : SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // KPI Grid Row
                        _buildKpiGrid(provider.dashboardMetrics),
                        const SizedBox(height: 32),
                        // Layout for version statistics and recent logs
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Left Column: Version Chart summary
                            Expanded(
                              flex: 2,
                              child: _buildVersionStatCard(provider.dashboardMetrics),
                            ),
                            const SizedBox(width: 24),
                            // Right Column: Raw Logs
                            Expanded(
                              flex: 5,
                              child: _buildLogsCard(provider.telemetryLogs),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildKpiGrid(Map<String, dynamic>? metrics) {
    if (metrics == null) return const SizedBox();

    final totalCrashes = metrics["total_crashes"] ?? 0;
    final driftedSessions = metrics["drifted_sessions"] ?? 0;
    final impactedSessions = metrics["impacted_sessions"] ?? 0;
    final prodVersion = metrics["active_production_version"] ?? "unknown";

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 2.2,
      children: [
        _buildKpiCard(
          "Total Crash Incidents",
          "$totalCrashes",
          Icons.bug_report,
          Colors.redAccent,
        ),
        _buildKpiCard(
          "Active Drifts Detected",
          "$driftedSessions",
          Icons.alt_route,
          Colors.orangeAccent,
        ),
        _buildKpiCard(
          "Impacted User Sessions",
          "$impactedSessions",
          Icons.people,
          Colors.blueAccent,
        ),
        _buildKpiCard(
          "Target Prod Version",
          "v$prodVersion",
          Icons.check_circle_outline,
          Colors.greenAccent,
        ),
      ],
    );
  }

  Widget _buildKpiCard(String label, String val, IconData icon, Color color) {
    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              radius: 24,
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    val,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildVersionStatCard(Map<String, dynamic>? metrics) {
    if (metrics == null) return const SizedBox();
    final versionCrashes = metrics["version_crashes"] as Map<String, dynamic>? ?? {};

    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Crashes by Client Version",
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (versionCrashes.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24.0),
                child: Center(
                  child: Text(
                    "No crash version data available.",
                    style: TextStyle(color: Color(0xFF94A3B8)),
                  ),
                ),
              )
            else
              ...versionCrashes.entries.map((e) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Version ${e.key}", style: const TextStyle(color: Colors.white70, fontSize: 13)),
                          Text("${e.value} crashes", style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: 1.0, 
                          color: Colors.blueAccent,
                          backgroundColor: const Color(0xFF334155),
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildLogsCard(List<dynamic>? logs) {
    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Recent Asset Error Logs",
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.blueAccent, size: 20),
                  onPressed: () => Provider.of<LoanWizardProvider>(context, listen: false).fetchDashboardData(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (logs == null || logs.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 40.0),
                child: Center(
                  child: Text(
                    "No logs recorded yet.",
                    style: TextStyle(color: Color(0xFF94A3B8)),
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: logs.length > 10 ? 10 : logs.length,
                separatorBuilder: (context, index) => const Divider(color: Color(0xFF334155)),
                itemBuilder: (context, index) {
                  final log = logs[index] as Map<String, dynamic>;
                  final dateStr = log["timestamp"] != null
                      ? DateTime.parse(log["timestamp"]).toLocal().toString().substring(0, 19)
                      : "unknown";
                  final assetName = log["target_asset_url"] != null
                      ? log["target_asset_url"].split('/').last
                      : "unknown";

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6.0),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                log["error_message"] ?? "ChunkLoadError",
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                "Asset: $assetName",
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Ver: ${log["client_version"]}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              Text("Token: ${log["session_id"]?.substring(0, 10)}...", style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                            ],
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(dateStr, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                        ),
                        ElevatedButton(
                          onPressed: () => _showStackTrace(log["error_message"] ?? "ChunkError", log["stack_trace"]),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF334155),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text("Inspect", style: TextStyle(fontSize: 11)),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
