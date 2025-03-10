import SwiftUI

@main
struct DictaphoneApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

class AppState: ObservableObject {
    let audioRecorder: AudioRecorder
    let whisperService: WhisperService
    
    @Published var apiKey: String {
        didSet {
            UserDefaults.standard.set(apiKey, forKey: "openai_api_key")
        }
    }
    
    init() {
        self.audioRecorder = AudioRecorder()
        self.apiKey = UserDefaults.standard.string(forKey: "openai_api_key") ?? ""
        self.whisperService = WhisperService(apiKey: self.apiKey)
    }
}

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingAPIKeyAlert = false
    
    var body: some View {
        Group {
            if appState.apiKey.isEmpty {
                APIKeySetupView(apiKey: $appState.apiKey)
            } else {
                RecorderScreen(
                    viewModel: RecorderViewModel(
                        audioRecorder: appState.audioRecorder,
                        whisperService: appState.whisperService
                    )
                )
            }
        }
        .onAppear {
            showingAPIKeyAlert = appState.apiKey.isEmpty
        }
    }
}

struct APIKeySetupView: View {
    @Binding var apiKey: String
    @State private var temporaryKey = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Configuration API")) {
                    TextField("Clé API OpenAI", text: $temporaryKey)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    Button("Sauvegarder") {
                        apiKey = temporaryKey
                    }
                    .disabled(temporaryKey.isEmpty)
                }
                
                Section(header: Text("Instructions")) {
                    Text("Pour utiliser cette application, vous devez fournir une clé API OpenAI. Vous pouvez en obtenir une sur le site d'OpenAI.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Configuration")
        }
    }
}
