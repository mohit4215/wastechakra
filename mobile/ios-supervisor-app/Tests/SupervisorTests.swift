import XCTest
@testable import EcoFleetSupervisor

final class SupervisorTests: XCTestCase {
    func testTicketCreation() {
        let t = WardReport(ticketId: "T-1", nodeId: "N-1", wardName: "W-1", description: "Desc", severity: .critical)
        XCTAssertEqual(t.severity, .critical)
        XCTAssertFalse(t.isResolved)
    }
}
