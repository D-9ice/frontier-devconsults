export const specializedProjectTypes = [
  'new_electronic_product', 'equipment_control_system', 'equipment_monitoring_system',
  'iot_remote_monitoring', 'energy_inverter_system', 'battery_management_monitoring',
  'industrial_automation', 'legacy_equipment_modernization', 'smart_retrofit',
  'embedded_firmware', 'electronic_control_board', 'mobile_equipment_app',
  'web_equipment_dashboard', 'oem_product_development', 'other_specialized_system',
] as const;

export const currentSystemStates = [
  'idea_only', 'existing_machine_equipment', 'existing_electronics', 'existing_pcb',
  'existing_firmware', 'existing_mobile_app', 'existing_web_app', 'existing_prototype',
  'existing_production_product', 'legacy_system', 'other',
] as const;

export const controlRequirementOptions = [
  'motor_speed', 'motor_direction', 'pump', 'fan', 'relay', 'lighting', 'heating',
  'cooling', 'actuator', 'valve', 'incline_elevation', 'inverter_mode',
  'battery_charge_parameters', 'machine_sequence', 'other', 'need_assessment',
] as const;

export const monitoringRequirementOptions = [
  'voltage', 'current', 'power', 'energy', 'battery_soc', 'temperature', 'rpm',
  'pressure', 'flow', 'runtime', 'faults', 'device_state', 'load', 'location',
  'environmental_sensor', 'other', 'need_assessment',
] as const;

export const interfaceRequirementOptions = [
  'mobile_app', 'web_dashboard', 'tablet', 'touchscreen', 'desktop_software',
  'physical_control_panel', 'cloud_portal', 'api', 'multiple_interfaces', 'need_recommendation',
] as const;

export const connectivityRequirementOptions = [
  'bluetooth', 'wifi', 'ethernet', 'cellular', 'rs485', 'modbus', 'can', 'mqtt',
  'local_only', 'cloud_connected', 'not_sure', 'need_recommendation',
] as const;

export const developmentScopeOptions = [
  'electronics_design', 'electrical_integration', 'firmware', 'pcb_control_board',
  'mobile_app', 'web_app', 'backend', 'cloud_infrastructure', 'device_connectivity',
  'prototype', 'retrofit', 'deployment', 'support', 'complete_end_to_end_system',
  'frontier_determine_scope',
] as const;

export const specializedTimelines = ['urgent', 'within_30_days', 'one_to_three_months', 'three_to_six_months', 'six_plus_months', 'flexible', 'need_assessment'] as const;
export const specializedBudgetChoices = ['prefer_not_to_disclose', 'need_estimate_first', 'prefer_to_discuss'] as const;
export const specializedStatuses = ['new', 'under_review', 'technical_assessment', 'clarification_required', 'consultation_scheduled', 'feasibility_review', 'proposal_preparation', 'proposal_sent', 'negotiation', 'approved', 'development', 'deployment', 'completed', 'declined', 'archived'] as const;
export const feasibilityStatuses = ['not_reviewed', 'feasible', 'needs_assessment', 'not_feasible'] as const;
export const consultationStatuses = ['not_requested', 'requested', 'scheduled', 'completed'] as const;

const titleCase = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const specializedLabels = {
  projectType: Object.fromEntries(specializedProjectTypes.map((value) => [value, titleCase(value)])) as Record<(typeof specializedProjectTypes)[number], string>,
  currentState: Object.fromEntries(currentSystemStates.map((value) => [value, value === 'legacy_system' ? 'Legacy system requiring modernization' : titleCase(value)])) as Record<(typeof currentSystemStates)[number], string>,
  control: Object.fromEntries(controlRequirementOptions.map((value) => [value, value === 'need_assessment' ? 'Need Frontier Assessment' : titleCase(value)])) as Record<(typeof controlRequirementOptions)[number], string>,
  monitoring: Object.fromEntries(monitoringRequirementOptions.map((value) => [value, value === 'need_assessment' ? 'Need Frontier Assessment' : titleCase(value)])) as Record<(typeof monitoringRequirementOptions)[number], string>,
  interface: Object.fromEntries(interfaceRequirementOptions.map((value) => [value, value === 'need_recommendation' ? 'Need Recommendation' : titleCase(value)])) as Record<(typeof interfaceRequirementOptions)[number], string>,
  connectivity: Object.fromEntries(connectivityRequirementOptions.map((value) => [value, value === 'need_recommendation' ? 'Need Frontier Recommendation' : titleCase(value).replace('Wifi', 'Wi-Fi').replace('Rs485', 'RS-485').replace('Mqtt', 'MQTT')])) as Record<(typeof connectivityRequirementOptions)[number], string>,
  scope: Object.fromEntries(developmentScopeOptions.map((value) => [value, value === 'frontier_determine_scope' ? 'Need Frontier to Determine Scope' : titleCase(value)])) as Record<(typeof developmentScopeOptions)[number], string>,
  timeline: { urgent: 'Urgent', within_30_days: 'Within 30 days', one_to_three_months: '1–3 months', three_to_six_months: '3–6 months', six_plus_months: '6+ months', flexible: 'Flexible', need_assessment: 'Need assessment' },
  budget: { prefer_not_to_disclose: 'Prefer not to disclose', need_estimate_first: 'Need estimate first', prefer_to_discuss: 'Prefer to discuss' },
} as const;
