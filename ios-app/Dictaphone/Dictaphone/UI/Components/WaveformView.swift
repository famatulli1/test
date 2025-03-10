import SwiftUI

struct WaveformView: View {
    let samples: [Float]
    let activeColor: Color
    let inactiveColor: Color
    let progress: Float
    
    init(
        samples: [Float],
        progress: Float = 0,
        activeColor: Color = .blue,
        inactiveColor: Color = Color.blue.opacity(0.3)
    ) {
        self.samples = samples
        self.progress = progress
        self.activeColor = activeColor
        self.inactiveColor = inactiveColor
    }
    
    var body: some View {
        GeometryReader { geometry in
            Canvas { context, size in
                let width = size.width
                let height = size.height
                let centerY = height / 2
                let progressWidth = width * CGFloat(progress)
                
                // Calculate bar width and spacing
                let barWidth: CGFloat = 3
                let spacing: CGFloat = 2
                let totalBars = Int((width / (barWidth + spacing)).rounded(.down))
                let step = max(1, samples.count / totalBars)
                
                // Draw bars
                for i in stride(from: 0, to: totalBars, by: 1) {
                    let x = CGFloat(i) * (barWidth + spacing)
                    let sampleIndex = i * step
                    guard sampleIndex < samples.count else { break }
                    
                    // Normalize amplitude to [0, 1]
                    let amplitude = normalize(samples[sampleIndex])
                    let barHeight = height * CGFloat(amplitude)
                    let y = centerY - (barHeight / 2)
                    
                    let rect = CGRect(x: x, y: y, width: barWidth, height: barHeight)
                    let path = Path(roundedRect: rect, cornerRadius: barWidth/2)
                    
                    context.fill(
                        path,
                        with: .color(x <= progressWidth ? activeColor : inactiveColor)
                    )
                }
            }
        }
    }
    
    private func normalize(_ sample: Float) -> Float {
        // Convert from dB to amplitude ratio, assuming input is in dB
        let minDb: Float = -60.0
        let normalized = (sample - minDb) / abs(minDb)
        return min(max(normalized, 0), 1)
    }
}

// Live Preview
struct WaveformView_Previews: PreviewProvider {
    static var previews: some View {
        WaveformView(
            samples: (0..<100).map { _ in Float.random(in: -60...0) },
            progress: 0.5
        )
        .frame(height: 100)
        .padding()
        .preferredColorScheme(.dark)
    }
}

// Custom Shape for better performance with many bars
struct WaveformShape: Shape {
    let samples: [Float]
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        let centerY = height / 2
        
        let barWidth: CGFloat = 3
        let spacing: CGFloat = 2
        let totalBars = Int((width / (barWidth + spacing)).rounded(.down))
        let step = max(1, samples.count / totalBars)
        
        for i in stride(from: 0, to: totalBars, by: 1) {
            let x = CGFloat(i) * (barWidth + spacing)
            let sampleIndex = i * step
            guard sampleIndex < samples.count else { break }
            
            let amplitude = normalize(samples[sampleIndex])
            let barHeight = height * CGFloat(amplitude)
            let y = centerY - (barHeight / 2)
            
            path.addRoundedRect(
                in: CGRect(x: x, y: y, width: barWidth, height: barHeight),
                cornerSize: CGSize(width: barWidth/2, height: barWidth/2)
            )
        }
        
        return path
    }
    
    private func normalize(_ sample: Float) -> Float {
        let minDb: Float = -60.0
        let normalized = (sample - minDb) / abs(minDb)
        return min(max(normalized, 0), 1)
    }
}
