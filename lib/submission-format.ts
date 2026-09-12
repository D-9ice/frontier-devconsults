type Details = Record<string, unknown>;

const text = (value: unknown, fallback = 'Not provided') => typeof value === 'string' && value.trim() ? value.trim() : fallback;

export function splitContactMessage(value: unknown) {
  const message = text(value, '');
  const match = message.match(/^Subject:\s*([^\n]*)\n\n([\s\S]*)$/i);
  return match ? { subject: text(match[1], '(no subject)'), message: text(match[2], '(no message)') }
    : { subject: '(no subject)', message: message || '(no message)' };
}

export function splitBuildDescription(value: unknown) {
  const description = text(value, '');
  const [projectName = '', ...parts] = description.split('\n\n');
  return { projectName: text(projectName, 'Unnamed project'), description: text(parts.join('\n\n'), '(no project description)') };
}

export function formatEnquiryNotification(recordType: string | null | undefined, details: Details, createdAt: string, adminLink: string) {
  if (recordType === 'security') {
    return [
      'Frontier security alert', '',
      `Timestamp: ${text(details.timestamp, createdAt)}`,
      `Category: ${text(details.category)}`,
      `Severity: ${text(details.severity)}`,
      `Route: ${text(details.route)}`,
      `Method: ${text(details.method)}`,
      `Sanitized source: ${text(details.sourceHash)}`,
      `Correlation ID: ${text(details.correlationId)}`,
      `Result: ${text(details.result)}`, '',
      `Review authenticated monitoring: ${adminLink}`,
    ].join('\n');
  }
  if (recordType === 'contact') {
    const parsed = splitContactMessage(details.message);
    return [
      'New Send Us a Message submission', '',
      `Name: ${text(details.name)}`,
      `Email: ${text(details.email)}`,
      `Phone: ${text(details.phone)}`,
      `Subject: ${parsed.subject}`, '',
      'Message:', parsed.message, '',
      `Submitted: ${createdAt}`,
      `Open in Frontier admin: ${adminLink}`,
    ].join('\n');
  }
  if (recordType === 'build') {
    const parsed = splitBuildDescription(details.description);
    return [
      'New Request a Build submission', '',
      `Project: ${parsed.projectName}`,
      `Name: ${text(details.name)}`,
      `Email: ${text(details.email)}`,
      `Phone: ${text(details.phone)}`,
      `Company: ${text(details.company)}`,
      `Project type: ${text(details.project_type)}`,
      `Budget: ${text(details.budget)}`,
      `Timeline: ${text(details.timeline)}`, '',
      'Project details:', parsed.description,
      `Features: ${text(details.features)}`,
      `Reference links: ${text(details.reference_links)}`, '',
      `Submitted: ${createdAt}`,
      `Open in Frontier admin: ${adminLink}`,
    ].join('\n');
  }
  if (recordType === 'acquisition') {
    return [
      'New application acquisition enquiry', '',
      `Reference: ${text(details.reference_number)}`,
      `Application: ${text(details.product_name)}`,
      `Buyer: ${text(details.buyer_full_name)}`,
      `Company: ${text(details.buyer_company)}`,
      `Email: ${text(details.buyer_email)}`,
      `Country: ${text(details.buyer_country)}`,
      `Acquisition type: ${text(details.acquisition_type)}`,
      `Timeline: ${text(details.acquisition_timeline)}`, '',
      `Submitted: ${createdAt}`,
      `Open in Frontier admin: ${adminLink}`,
    ].join('\n');
  }
  if (recordType === 'specialized') {
    return [
      'New specialized engineering enquiry', '',
      `Reference: ${text(details.reference_number)}`,
      `Name: ${text(details.full_name)}`,
      `Email: ${text(details.email)}`,
      `Company: ${text(details.company)}`,
      `Country: ${text(details.country)}`,
      `Project types: ${Array.isArray(details.project_types) ? details.project_types.join(', ') : text(details.project_types)}`,
      `Timeline: ${text(details.timeline)}`, '',
      'Project description:', text(details.project_description), '',
      `Submitted: ${createdAt}`,
      `Open in Frontier admin: ${adminLink}`,
    ].join('\n');
  }
  return `${text(details.subject, 'New owner alert')}\nSaved/event time: ${createdAt}\n\n${JSON.stringify(details, null, 2)}\n\nAuthenticated admin record: ${adminLink}`;
}
