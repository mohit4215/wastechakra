import SwiftUI

public struct SeverityBadgeView: View {
    public let severity: IncidentSeverity

    public var body: some View {
        Text(severity.rawValue)
            .font(.caption2.bold())
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(badgeColor.opacity(0.2))
            .foregroundColor(badgeColor)
            .cornerRadius(4)
    }

    private var badgeColor: Color {
        switch severity {
        case .low: return .green
        case .medium: return .yellow
        case .high: return .orange
        case .critical: return .red
        }
    }
}
