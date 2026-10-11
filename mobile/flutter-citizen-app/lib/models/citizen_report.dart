class CitizenReport {
  final String? ticketId;
  final String nodeId;
  final String reporterName;
  final String reporterPhone;
  final String issueType;
  final String description;
  final DateTime createdAt;
  final String status;

  CitizenReport({
    this.ticketId,
    required this.nodeId,
    required this.reporterName,
    required this.reporterPhone,
    required this.issueType,
    required this.description,
    DateTime? createdAt,
    this.status = 'Pending Review',
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'node_id': nodeId,
    'reporter_name': reporterName,
    'reporter_phone': reporterPhone,
    'issue_type': issueType,
    'description': description,
  };
}
