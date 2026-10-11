import Foundation

public actor SupervisorAPIClient {
    public static let shared = SupervisorAPIClient()
    private let baseURL: URL

    public init(baseURL: URL = URL(string: "http://127.0.0.1:8000/api")!) {
        self.baseURL = baseURL
    }

    public func fetchWardTickets() async throws -> [WardReport] {
        return [
            WardReport(ticketId: "TICKET-MCD-001", nodeId: "NODE-001", wardName: "Lajpat Nagar", description: "Market overflow", severity: .critical),
            WardReport(ticketId: "TICKET-MCD-002", nodeId: "NODE-017", wardName: "Saket Mall", description: "Food court odour", severity: .medium)
        ]
    }
}
