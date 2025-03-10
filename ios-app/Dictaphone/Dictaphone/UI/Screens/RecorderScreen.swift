import SwiftUI
import AVFoundation

class RecorderViewModel: ObservableObject {
    @Published var recordingState: RecordingState = .idle
    @Published var waveformData: [Float] = []
    @Published var duration: TimeInterval = 0
    @Published var isTranscribing = false
    @Published var error: String? = nil
    @Published var transcription: String? = nil
    
    private let audioRecorder: AudioRecorder
    private let whisperService: WhisperService
    private var currentRecordingURL: URL?
    
    init(audioRecorder: AudioRecorder, whisperService: WhisperService) {
        self.audioRecorder = audioRecorder
        self.whisperService = whisperService
    }
    
    func startRecording() {
        do {
            currentRecordingURL = try audioRecorder.startRecording()
            recordingState = .recording
        } catch {
            self.error = error.localizedDescription
        }
    }
    
    func stopRecording() {
        audioRecorder.stopRecording()
        recordingState = .idle
        
        guard let url = currentRecordingURL else { return }
        
        Task {
            do {
                isTranscribing = true
                let text = try await whisperService.transcribe(audioFile: url)
                DispatchQueue.main.async {
                    self.transcription = text
                    self.isTranscribing = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = error.localizedDescription
                    self.isTranscribing = false
                }
            }
        }
    }
}

struct RecorderScreen: View {
    @StateObject private var viewModel: RecorderViewModel
    @Environment(\.colorScheme) private var colorScheme
    
    init(viewModel: RecorderViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Theme.adaptiveBackground(colorScheme)
                    .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    // Timer
                    Text(formatDuration(viewModel.duration))
                        .font(.system(size: 60, weight: .light, design: .monospaced))
                        .foregroundColor(Theme.primary)
                    
                    // Waveform
                    WaveformView(
                        samples: viewModel.waveformData,
                        activeColor: Theme.primary,
                        inactiveColor: Theme.primary.opacity(0.3)
                    )
                    .frame(height: 100)
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    // Recording Controls
                    HStack(spacing: 20) {
                        switch viewModel.recordingState {
                        case .idle:
                            RecordButton(action: viewModel.startRecording)
                        case .recording:
                            StopButton(action: viewModel.stopRecording)
                        case .playing:
                            StopButton(action: viewModel.stopRecording)
                        case .error:
                            RecordButton(action: viewModel.startRecording)
                        }
                    }
                    .padding(.bottom, 30)
                }
                .padding()
            }
            .navigationTitle("Dictaphone")
            .alert("Erreur", isPresented: .constant(viewModel.error != nil)) {
                Button("OK") {
                    viewModel.error = nil
                }
            } message: {
                Text(viewModel.error ?? "")
            }
            .overlay {
                if viewModel.isTranscribing {
                    TranscribingOverlay()
                }
            }
        }
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

struct RecordButton: View {
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(Theme.primary)
                    .frame(width: 80, height: 80)
                
                Image(systemName: "mic.fill")
                    .font(.title)
                    .foregroundColor(.white)
            }
        }
    }
}

struct StopButton: View {
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(Theme.error)
                    .frame(width: 80, height: 80)
                
                Image(systemName: "stop.fill")
                    .font(.title)
                    .foregroundColor(.white)
            }
        }
    }
}

struct TranscribingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            
            VStack {
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)
                
                Text("Transcription en cours...")
                    .foregroundColor(.white)
                    .padding(.top)
            }
        }
    }
}
