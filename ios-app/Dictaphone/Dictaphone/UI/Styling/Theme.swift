import SwiftUI

enum Theme {
    static let primary = Color("Primary")
    static let secondary = Color("Secondary")
    static let background = Color("Background")
    static let surface = Color("Surface")
    static let error = Color("Error")
    
    static func adaptiveBackground(_ colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(.systemBackground) : .white
    }
    
    static func adaptiveSurface(_ colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(.secondarySystemBackground) : Color(.systemGray6)
    }
}

struct ThemeModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    
    func body(content: Content) -> some View {
        content
            .preferredColorScheme(colorScheme)
            .background(Theme.adaptiveBackground(colorScheme))
    }
}

extension View {
    func withTheme() -> some View {
        modifier(ThemeModifier())
    }
}
