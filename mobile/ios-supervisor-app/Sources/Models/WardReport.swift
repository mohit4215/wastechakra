import Foundation

public struct WardReport: Identifiable, Codable {
    public let id: UUID
    public let ticketId: String
    public let nodeId: String
    public let wardName: String
    public let description: String
    public let severity: IncidentSeverity
    public let reportedAt: Date
    public var isResolved: Bool

    public init(
        id: UUID = UUID(),
        ticketId: String,
        nodeId: String,
        wardName: String,
        description: String,
        severity: IncidentSeverity,
        reportedAt: Date = Date(),
        isResolved: Bool = false
    ) {
        self.id = id
        self.ticketId = ticketId
        self.nodeId = nodeId
        self.wardName = wardName
        self.description = description
        self.severity = severity
        self.reportedAt = reportedAt
        self.isResolved = isResolved
    }
}
