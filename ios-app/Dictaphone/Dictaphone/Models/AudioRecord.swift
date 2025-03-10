import Foundation

struct AudioRecord: Identifiable, Codable {
    let id: UUID
    let url: URL
    let duration: TimeInterval
    let timestamp: Date
    var transcription: String?
    
    var fileName: String {
        url.lastPathComponent
    }
}

enum RecordingState: Equatable {
    case idle
    case recording
    case playing(progress: Float)
    case error(message: String)
}

struct RecorderState {
    var recordingState: RecordingState = .idle
    var duration: TimeInterval = 0
    var waveformData: [Float] = []
    var isTranscribing: Bool = false
    var error: String? = nil
}
