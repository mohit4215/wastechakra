import SwiftUI

public struct TicketRowView: View {
    public let ticket: WardReport
    public let onToggle: () -> Void

    public var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(ticket.wardName).font(.headline)
                Text(ticket.description).font(.subheadline).foregroundColor(.secondary)
            }
            Spacer()
            SeverityBadgeView(severity: ticket.severity)
        }
    }
}
