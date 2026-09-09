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
  return `${text(details.subject, 'New owner alert')}\nSaved/event time: ${createdAt}\n\n${JSON.stringify(details, null, 2)}\n\nAuthenticated admin record: ${adminLink}`;
}
