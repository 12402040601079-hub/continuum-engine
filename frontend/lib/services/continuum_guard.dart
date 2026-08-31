import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ContinuumGuard {
  final String backendUrl; // Base API URL (e.g. http://localhost:8000/api/v1)
  final String clientVersion = "1.0.0"; // Current running client version

  ContinuumGuard({required this.backendUrl});

  // Storage Keys
  static const String _keySessionToken = "continuum_session_token";
  static const String _keyLocalSnapshot = "continuum_local_snapshot";
  static const String _keySessionJwt = "continuum_session_jwt";

  String? _cachedJwt;

  /// Gets the existing unique session token or generates a new one.
  Future<String> getOrCreateSessionToken() async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString(_keySessionToken);
    if (token == null) {
      // Secure local session ID generation
      token = "sess-${DateTime.now().millisecondsSinceEpoch}-${_generateRandomString(6)}";
      await prefs.setString(_keySessionToken, token);
    }
    return token;
  }

  String _generateRandomString(int len) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    final rand = DateTime.now().microsecondsSinceEpoch;
    return List.generate(len, (index) => chars[(rand + index) % chars.length]).join();
  }

  /// Fetches a JWT session token from the backend or returns a cached one.
  Future<String?> getOrCreateSessionJwt(String sessionToken) async {
    if (_cachedJwt != null) return _cachedJwt;
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString(_keySessionJwt);
    if (token == null) {
      try {
        final response = await http.post(
          Uri.parse("$backendUrl/session/token"),
          headers: {"Content-Type": "application/json"},
          body: json.encode({"session_id": sessionToken}),
        );
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          token = data["access_token"];
          if (token != null) {
            await prefs.setString(_keySessionJwt, token);
          }
        }
      } catch (e) {
        print("Failed to get session JWT token from backend: $e");
      }
    }
    _cachedJwt = token;
    return token;
  }

  /// Compares the local version against the server to check for version drifts.
  Future<Map<String, dynamic>> checkVersionDrift() async {
    try {
      final response = await http.get(Uri.parse("$backendUrl/version/check"));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final String serverVersion = data["active_version"] ?? clientVersion;
        return {
          "isDrifted": serverVersion != clientVersion,
          "serverVersion": serverVersion,
          "clientVersion": clientVersion,
        };
      }
    } catch (e) {
      print("Version check failed, assuming no drift: $e");
    }
    return {
      "isDrifted": false,
      "serverVersion": clientVersion,
      "clientVersion": clientVersion,
    };
  }

  /// Writes the active form inputs and current step to the local device storage.
  Future<void> saveLocalSnapshot(int currentStep, Map<String, dynamic> formData) async {
    final prefs = await SharedPreferences.getInstance();
    final snapshot = {
      "client_version": clientVersion,
      "current_step": currentStep,
      "form_data": formData,
      "timestamp": DateTime.now().toIso8601String(),
    };
    await prefs.setString(_keyLocalSnapshot, json.encode(snapshot));
  }

  /// Retrieves the unsubmitted state saved locally.
  Future<Map<String, dynamic>?> getLocalSnapshot() async {
    final prefs = await SharedPreferences.getInstance();
    final String? snapshotStr = prefs.getString(_keyLocalSnapshot);
    if (snapshotStr != null) {
      return json.decode(snapshotStr) as Map<String, dynamic>;
    }
    return null;
  }

  /// Vaults the application session state securely to the database.
  Future<bool> vaultState(String sessionToken, int currentStep, Map<String, dynamic> formData) async {
    try {
      final jwt = await getOrCreateSessionJwt(sessionToken);
      final payload = {
        "session_id": sessionToken,
        "client_version": clientVersion,
        "current_step": currentStep,
        "form_data": formData,
      };

      final response = await http.post(
        Uri.parse("$backendUrl/session/vault"),
        headers: {
          "Content-Type": "application/json",
          if (jwt != null) "Authorization": "Bearer $jwt",
        },
        body: json.encode(payload),
      );

      return response.statusCode == 200;
    } catch (e) {
      print("Failed to vault state to backend: $e");
      return false;
    }
  }

  /// Rehydrates the session snapshot from the database.
  Future<Map<String, dynamic>?> rehydrateState(String sessionToken) async {
    try {
      final jwt = await getOrCreateSessionJwt(sessionToken);
      final response = await http.get(
        Uri.parse("$backendUrl/session/rehydrate/$sessionToken"),
        headers: {
          if (jwt != null) "Authorization": "Bearer $jwt",
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
    } catch (e) {
      print("Failed to rehydrate session from backend: $e");
    }
    return null;
  }

  /// Records client crash telemetry and version drift failures.
  Future<void> logTelemetry({
    required String sessionToken,
    required String targetAssetUrl,
    required String errorMessage,
    String? stackTrace,
  }) async {
    try {
      final jwt = await getOrCreateSessionJwt(sessionToken);
      final payload = {
        "session_id": sessionToken,
        "client_version": clientVersion,
        "target_asset_url": targetAssetUrl,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlutterWeb/1.0",
        "error_message": errorMessage,
        "stack_trace": stackTrace,
      };

      await http.post(
        Uri.parse("$backendUrl/telemetry/log"),
        headers: {
          "Content-Type": "application/json",
          if (jwt != null) "Authorization": "Bearer $jwt",
        },
        body: json.encode(payload),
      );
    } catch (e) {
      print("Telemetry logging request failed: $e");
    }
  }

  /// Clears the cached session and local snapshot upon successful form submission.
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keySessionToken);
    await prefs.remove(_keyLocalSnapshot);
    await prefs.remove(_keySessionJwt);
    _cachedJwt = null;
  }
}
