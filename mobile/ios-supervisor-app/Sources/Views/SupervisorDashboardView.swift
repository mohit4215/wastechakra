import SwiftUI

public struct SupervisorDashboardView: View {
    @StateObject private var viewModel = SupervisorViewModel()

    public init() {}

    public var body: some View {
        NavigationView {
            List(viewModel.tickets) { ticket in
                TicketRowView(ticket: ticket, onToggle: {
                    viewModel.toggleResolved(ticket: ticket)
                })
            }
            .navigationTitle("MCD Ward Inspector")
            .task {
                await viewModel.loadTickets()
            }
        }
    }
}
