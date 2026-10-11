import Foundation
import SwiftUI

@MainActor
public class SupervisorViewModel: ObservableObject {
    @Published public var tickets: [WardReport] = []
    @Published public var isLoading: Bool = false

    private let client: SupervisorAPIClient

    public init(client: SupervisorAPIClient = .shared) {
        self.client = client
    }

    public func loadTickets() async {
        isLoading = true
        defer { isLoading = false }
        do {
            self.tickets = try await client.fetchWardTickets()
        } catch {
            print("Failed: \(error)")
        }
    }

    public func toggleResolved(ticket: WardReport) {
        if let idx = tickets.firstIndex(where: { $0.id == ticket.id }) {
            tickets[idx].isResolved.toggle()
        }
    }
}
