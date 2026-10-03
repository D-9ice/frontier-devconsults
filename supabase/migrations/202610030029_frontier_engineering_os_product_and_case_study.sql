-- Replace standalone AI PCB Matrix commercial listing with Frontier Engineering OS.
-- Preserve the AI PCB Matrix vision as an integrated long-term autonomous PCB design subsystem.
BEGIN;

UPDATE public.apps
SET
  name = 'Frontier Engineering OS',
  slug = 'frontier-engineering-os',
  category = 'Engineering Platform / Instrumentation / AI / PCB & EDA',
  version = '1.0.0-foundation',
  size = NULL,
  rating = NULL,
  downloads = NULL,
  description = 'Frontier Engineering OS is a unified electronic engineering operating environment that brings professional measurement, diagnostics, data acquisition, AI-assisted troubleshooting, component intelligence, PCB/EDA workflows, manufacturing preparation, project records, reporting and modular hardware control into one extensible platform—taking engineers from measurement and fault isolation through design, fabrication and documented engineering outcomes.

The current software foundation provides a multi-instrument engineering workbench with DMM, oscilloscope, spectrum-analysis, logic-analysis, signal-generation/AWG and data-logging interfaces; project and session management; Frontier Intelligence; a verified engineering knowledge base; controlled engineering-data provenance; engineering reports; component tools; calculators; PCB/EDA and manufacturing workspaces; PWA installation; responsive desktop/tablet/mobile behavior; and a hardware-abstraction architecture for future physical instrumentation.

Frontier Engineering Instruments is the modular hardware ecosystem being engineered to connect real acquisition, generation, logic, precision and future specialized modules to the same software environment. The Gen-1 Rev-A hardware architecture is defined in the engineering repository but has not yet been fabricated, calibrated or released as a certified physical instrument.

The original AI PCB Matrix vision is being carried forward inside Frontier Engineering OS as its Autonomous PCB Design Intelligence program rather than as a separate standalone product. Its long-term objective remains ambitious and unchanged: an engineer should be able to describe a required circuit or product in natural language and progressively have the system reason through requirements, schematic generation, component selection, electrical constraints, PCB placement and routing, ERC/DRC iteration, BOM creation, Gerber/drill/pick-and-place generation, manufacturing-package validation and provider handoff. This capability is an active research and development roadmap, not a claim that fully autonomous production-ready PCB generation is available today.',
  features = ARRAY[
    'Unified electronic engineering operating environment',
    'Multi-instrument engineering workbench',
    'Digital multimeter interface',
    'Dual-channel oscilloscope interface',
    'Spectrum-analysis workspace',
    '8-channel logic-analyzer interface',
    'Signal generator / arbitrary waveform generator interface',
    'Universal engineering data logger',
    'Desktop multi-instrument layouts with collapsible sidebar',
    'Responsive tablet and mobile workspace behavior',
    'Projects and engineering sessions',
    'Project-scoped instrument workspace layouts',
    'Frontier Intelligence diagnostics framework',
    'Verified engineering knowledge base',
    'Controlled engineering-data provenance',
    'Consent-aware anonymized engineering case datasets',
    'Recursive engineering-AI training architecture for verified cases',
    'Engineering reports and diagnostic/fault dossiers',
    'PCB & EDA workspace',
    'Component subsystem and component records',
    'Engineering calculators',
    'Manufacturing and fabrication package workflow',
    'Provider-neutral manufacturing architecture',
    'Hardware abstraction layer and capability discovery',
    'Device Manager for simulator and future physical modules',
    'Frontier Instrument Protocol control/data architecture',
    'WebUSB physical-device adapter foundation',
    'Installable Progressive Web App',
    'Offline-capable application shell',
    'Gen-1 STM32H743 + ESP32-S3 + Artix-7 hardware architecture',
    'ADS1262 precision measurement architecture',
    'AD9238-65 dual-channel scope architecture',
    'AD9744 waveform-generation architecture',
    'Gen-1 through Gen-4 voltage and safety roadmap',
    'AI PCB Matrix integrated as Autonomous PCB Design Intelligence R&D'
  ],
  requirements = ARRAY[
    'Modern desktop, laptop or tablet browser for the current software foundation',
    'PWA-capable browser for installation',
    'Physical Frontier Engineering Instruments hardware required for real measurements when released',
    'Current public preview operates in simulator/foundation mode',
    'Some future cloud, collaboration and AI services may require internet connectivity',
    'Hazardous-live field measurements require future independently tested/certified hardware generations and accessories'
  ],
  icon_url = NULL,
  screenshot_urls = ARRAY[]::text[],
  video_url = NULL,
  play_store_link = NULL,
  download_link = NULL,
  status = 'Development',
  visibility = 'published',
  featured = TRUE,
  published_at = COALESCE(published_at, now()),
  solution_kind = 'engineering_solution',
  availability = 'by_enquiry',
  primary_action = 'visit_live',
  show_in_projects = FALSE,
  show_in_upwork_portfolio = FALSE,
  show_in_products = TRUE,
  commercial_modes = ARRAY['exclusive_license','non_exclusive_license','custom_deployment','strategic_partnership','custom_completion'],
  starting_price_usd_minor = NULL,
  price_visibility = 'enquire',
  demo_url = 'https://frontier-engineering-os-liard.vercel.app',
  technologies = ARRAY[
    'React 19',
    'TypeScript 7',
    'Vite 8',
    'Tailwind CSS 4',
    'Motion',
    'Progressive Web App',
    'Hardware Abstraction Layer',
    'Frontier Instrument Protocol',
    'WebUSB integration foundation',
    'GitHub Actions',
    'CMake/GCC firmware reference',
    'SystemVerilog FPGA reference',
    'STM32H743 Gen-1 architecture',
    'ESP32-S3 Gen-1 architecture',
    'AMD Artix-7 XC7A35T Gen-1 architecture',
    'ADS1262 precision ADC architecture',
    'AD9238-65 scope ADC architecture',
    'AD9744 AWG architecture'
  ],
  client_problem = 'Electronic engineering work is fragmented across separate bench instruments, disconnected software tools, data files, component references, PCB design environments, manufacturing portals and reports. This duplicates displays and controls, breaks engineering context between diagnosis and design, and makes it difficult to build reusable verified data for future engineering intelligence.',
  solution_summary = 'Frontier Engineering OS consolidates the electronic engineering workflow into one extensible environment. Modular physical instruments provide acquisition and generation while the software supplies visualization, analysis, project context, logging, diagnostics, knowledge, PCB/EDA workflow, manufacturing preparation and progressively more capable engineering AI.',
  responsibilities = ARRAY[
    'Product and systems architecture',
    'Engineering workflow design',
    'Multi-instrument UI/UX',
    'Hardware abstraction and device architecture',
    'Project/session and engineering-data models',
    'Frontier Intelligence and knowledge-base architecture',
    'Controlled AI-training data provenance',
    'PCB/EDA and manufacturing workflow architecture',
    'Gen-1 instrumentation hardware engineering',
    'FIP control and acquisition protocol',
    'Reference STM32 firmware and FPGA RTL scaffolding',
    'Safety-generation and certification roadmap',
    'Validation, deployment and release engineering'
  ],
  challenges = ARRAY[
    'Separating precision, high-speed, digital and future RF measurement functions into appropriate modular front ends',
    'Maintaining truthful simulator-versus-physical capability reporting',
    'Moving high-rate acquisition through FPGA, MCU and host interfaces without unrealistic throughput claims',
    'Preserving calibration, provenance and traceability across engineering sessions',
    'Designing a future hazardous-voltage path without treating high voltage as a simple divider change',
    'Building recursive engineering AI only from controlled, verified and consent-eligible engineering cases',
    'Preserving the AI PCB Matrix vision while clearly distinguishing autonomous PCB R&D from current EDA foundation capabilities'
  ],
  outcomes = jsonb_build_array(
    jsonb_build_object('label','Installable engineering workspace','value','PWA verified in live preview','evidenceNote','PWA installation and core workspace behavior were manually verified during the current foundation release.'),
    jsonb_build_object('label','Multi-instrument environment','value','Implemented','evidenceNote','The current UI supports simultaneous engineering instrument panels and collapsible navigation.'),
    jsonb_build_object('label','Gen-1 hardware definition','value','Repository engineering package complete for review','evidenceNote','Physical fabrication, calibration and safety certification remain external evidence gates.'),
    jsonb_build_object('label','Physical instrument release','value','Not yet released','evidenceNote','The current public system must not be represented as a fabricated or certified measurement instrument.')
  ),
  confidentiality_note = NULL,
  deployment_options = ARRAY[
    'Installable web/PWA engineering workspace',
    'Desktop/laptop engineering workstation',
    'Tablet engineering interface',
    'Future dedicated host for Frontier Engineering Instruments hardware',
    'Licensed/custom deployment by agreed scope'
  ],
  support_summary = 'Frontier Engineering OS is under active development. Software demonstrations, licensing discussions, strategic partnerships and custom deployment planning are available by enquiry. Physical instrument modules and hazardous-live measurement capability are not yet released.',
  customization_available = TRUE,
  license_terms_url = NULL,
  lifecycle = 'in_development',
  external_url_verified_at = now(),
  thumbnail_url = NULL,
  upwork_skill_tags = ARRAY[
    'React','TypeScript','Vite','PWA','Embedded Systems','Electronics Engineering','FPGA','STM32','ESP32','Data Acquisition','PCB Design','AI Integration'
  ],
  upwork_relevance = 'Demonstrates cross-disciplinary software, electronics, embedded-systems, instrumentation, FPGA, data and AI architecture in one engineering platform.',
  artifact_version = NULL,
  artifact_platform = NULL,
  artifact_byte_size = NULL,
  artifact_release_date = NULL,
  artifact_checksum = NULL,
  artifact_verified_at = NULL,
  artifact_availability = 'unavailable',
  artifact_build = NULL,
  artifact_filename = NULL,
  tagline = 'The All-Inclusive Engineering Workbench — Measure. Analyze. Diagnose. Design. Build.',
  short_description = 'A unified electronic engineering operating environment combining modular instrumentation, diagnostics, data acquisition, engineering intelligence, PCB/EDA workflows, manufacturing preparation and project documentation in one extensible platform.',
  development_status = 'in_development',
  completion_percentage = NULL,
  roadmap_items = ARRAY[
    'AI PCB Matrix / Autonomous PCB Design Intelligence: progress from natural-language engineering requirements toward production-ready schematic and PCB generation with engineer approval gates.',
    'Automated component selection, constraint reasoning, schematic synthesis, placement, routing and iterative ERC/DRC correction.',
    'Automatic BOM, Gerber, drill, pick-and-place and manufacturing-package generation with provider-neutral handoff.',
    'Fabricate and validate the Gen-1 Frontier Universal Instrument Hub hardware.',
    'Complete native EDA adapters and real manufacturing-provider integrations.',
    'Develop Gen-2 isolated safety architecture and Gen-3 certified hazardous-live field instrumentation.',
    'Add dedicated RF, LCR/impedance, power, automotive, industrial and other specialized modules.'
  ],
  technology_stack = jsonb_build_object(
    'Software', jsonb_build_array('React 19','TypeScript 7','Vite 8','Tailwind CSS 4','Motion','Progressive Web App'),
    'Engineering Platform', jsonb_build_array('Hardware Abstraction Layer','Frontier Instrument Protocol','Project/Session Model','Engineering Data Logger','Frontier Intelligence','Verified Engineering Knowledge Base'),
    'Gen-1 Hardware Architecture', jsonb_build_array('STM32H743ZI','ESP32-S3','AMD Artix-7 XC7A35T','ADS1262','AD9238-65','AD9744','USB3320','CDCE6214'),
    'Validation', jsonb_build_array('Strict TypeScript','Acceptance Tests','GitHub Actions','CMake/GCC Firmware Reference','SystemVerilog/Icarus Reference Simulation','Vivado Release Gates')
  ),
  seo_title = 'Frontier Engineering OS | Unified Engineering Workbench & Instrumentation Platform',
  seo_description = 'Frontier Engineering OS unifies electronic measurement, diagnostics, engineering AI, PCB/EDA, manufacturing workflows, reports and modular instrumentation in one extensible platform.',
  og_image_url = NULL,
  updated_at = now()
WHERE slug = 'pcb-matrix' OR name = 'AI PCB Matrix';

UPDATE public.projects
SET
  title = 'Frontier Engineering OS',
  category = 'Engineering Platform / Instrumentation / AI / PCB & EDA',
  status = 'Development',
  visibility = 'published',
  featured = TRUE,
  sort_order = 13,
  description = 'Frontier Engineering OS is Frontier DevConsults'' unified electronic engineering workbench: a single extensible environment for measurement, diagnostics, multi-instrument operation, engineering data, AI-assisted troubleshooting, project records, component intelligence, PCB/EDA workflows, manufacturing preparation and technical reporting. The current software foundation is operational as an installable PWA and simulator-first engineering workspace. The Gen-1 physical instrumentation architecture is defined but not yet fabricated or certified. The original AI PCB Matrix vision is retained inside the platform as Autonomous PCB Design Intelligence R&D, with the long-term objective of progressing from natural-language requirements to engineer-reviewed production-ready PCB outputs.',
  technologies = ARRAY[
    'React 19','TypeScript 7','Vite 8','Tailwind CSS 4','Progressive Web App',
    'Hardware Abstraction Layer','Frontier Instrument Protocol','WebUSB integration foundation',
    'STM32H743 Gen-1 architecture','ESP32-S3 Gen-1 architecture','AMD Artix-7 XC7A35T Gen-1 architecture',
    'ADS1262','AD9238-65','AD9744','GitHub Actions','SystemVerilog reference RTL','CMake/GCC firmware reference'
  ],
  features = ARRAY[
    'Multi-instrument engineering workbench',
    'Digital multimeter, oscilloscope, spectrum, logic, AWG and data-logger interfaces',
    'Projects and engineering sessions',
    'Frontier Intelligence diagnostics framework',
    'Verified engineering knowledge base',
    'Controlled recursive AI-training data architecture',
    'PCB & EDA workspace',
    'Component subsystem',
    'Engineering calculators',
    'Manufacturing and fabrication workflow',
    'Engineering reports',
    'Hardware abstraction and capability discovery',
    'Gen-1 modular instrumentation hardware architecture',
    'Installable PWA',
    'AI PCB Matrix integrated as Autonomous PCB Design Intelligence R&D'
  ],
  live_link = 'https://frontier-engineering-os-liard.vercel.app',
  download_link = NULL,
  color = 'blue',
  updated_at = now()
WHERE slug = 'frontier-engineering-os';

INSERT INTO public.projects (
  title, slug, category, status, visibility, featured, sort_order, description,
  technologies, features, logo_url, live_link, download_link, color, gallery_urls,
  published_at, updated_at
)
SELECT
  'Frontier Engineering OS',
  'frontier-engineering-os',
  'Engineering Platform / Instrumentation / AI / PCB & EDA',
  'Development',
  'published',
  TRUE,
  13,
  'Frontier Engineering OS is Frontier DevConsults'' unified electronic engineering workbench: a single extensible environment for measurement, diagnostics, multi-instrument operation, engineering data, AI-assisted troubleshooting, project records, component intelligence, PCB/EDA workflows, manufacturing preparation and technical reporting. The current software foundation is operational as an installable PWA and simulator-first engineering workspace. The Gen-1 physical instrumentation architecture is defined but not yet fabricated or certified. The original AI PCB Matrix vision is retained inside the platform as Autonomous PCB Design Intelligence R&D, with the long-term objective of progressing from natural-language requirements to engineer-reviewed production-ready PCB outputs.',
  ARRAY[
    'React 19','TypeScript 7','Vite 8','Tailwind CSS 4','Progressive Web App',
    'Hardware Abstraction Layer','Frontier Instrument Protocol','WebUSB integration foundation',
    'STM32H743 Gen-1 architecture','ESP32-S3 Gen-1 architecture','AMD Artix-7 XC7A35T Gen-1 architecture',
    'ADS1262','AD9238-65','AD9744','GitHub Actions','SystemVerilog reference RTL','CMake/GCC firmware reference'
  ],
  ARRAY[
    'Multi-instrument engineering workbench',
    'Digital multimeter, oscilloscope, spectrum, logic, AWG and data-logger interfaces',
    'Projects and engineering sessions',
    'Frontier Intelligence diagnostics framework',
    'Verified engineering knowledge base',
    'Controlled recursive AI-training data architecture',
    'PCB & EDA workspace',
    'Component subsystem',
    'Engineering calculators',
    'Manufacturing and fabrication workflow',
    'Engineering reports',
    'Hardware abstraction and capability discovery',
    'Gen-1 modular instrumentation hardware architecture',
    'Installable PWA',
    'AI PCB Matrix integrated as Autonomous PCB Design Intelligence R&D'
  ],
  NULL,
  'https://frontier-engineering-os-liard.vercel.app',
  NULL,
  'blue',
  ARRAY[]::text[],
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects WHERE slug = 'frontier-engineering-os'
);

INSERT INTO public.case_studies (
  project_id, app_id, slug, ownership_type, commercial_state, client_commercial_authorized,
  visibility, executive_summary, intended_market, engineering_responsibility,
  problem_opportunity, objectives, challenges_constraints, engineering_approach,
  architecture, engineering_decisions, capabilities, problems_solutions,
  security_reliability, performance_scalability, user_experience,
  technology_architecture, project_status, engineering_insights, evidence,
  section_order, seo_title, seo_description, published_at, updated_at
)
SELECT
  p.id,
  NULL,
  'frontier-engineering-os',
  'frontier_product',
  'available_for_licensing',
  FALSE,
  'published',
  'Frontier Engineering OS is a Frontier DevConsults-owned unified electronic engineering operating environment. It combines multi-instrument measurement interfaces, diagnostics, engineering data acquisition, project/session management, Frontier Intelligence, a verified engineering knowledge base, component and calculator tools, PCB/EDA and manufacturing workflows, engineering reports and a modular hardware architecture in one system. The current software foundation is operational as an installable PWA and simulator-first workbench. Gen-1 physical hardware has been engineered at repository/architecture level but has not yet been fabricated, calibrated or certified. The original AI PCB Matrix vision now continues inside Frontier Engineering OS as Autonomous PCB Design Intelligence R&D, preserving the long-term objective of natural-language-to-production-ready PCB generation rather than limiting the concept to AI assistance layered over existing PCB tools.',
  'Professional electronic engineers, technicians, R&D teams, repair and service engineers, embedded-systems developers, power-electronics engineers, industrial and automotive engineering teams, electronics laboratories, educators, students, product developers and organizations that need an integrated measurement-to-design-to-manufacturing engineering environment.',
  'Frontier DevConsults owns the product architecture and implementation across the software workbench, instrument registry, project/session data model, engineering-data logging, Frontier Intelligence, verified case knowledge base, controlled AI-training provenance, PCB/EDA and manufacturing workflow, hardware abstraction layer, Frontier Instrument Protocol, Gen-1 hardware architecture, reference STM32 firmware/FPGA RTL, safety-generation roadmap and release validation framework.',
  'Electronic engineering workflows are commonly fragmented across standalone instruments, separate analysis programs, disconnected data files, component references, EDA tools, manufacturer portals and manually assembled reports. This duplicates user interfaces, loses context between diagnosis and redesign, makes collaboration and traceability harder, and prevents engineering evidence from naturally accumulating into a reusable verified knowledge base. Frontier Engineering OS addresses this by treating the complete engineering workflow as one persistent operating environment.',
  jsonb_build_array(
    'Create one persistent engineering environment from measurement through manufacture.',
    'Replace duplicated standalone instrument interfaces with modular physical instrumentation controlled through a common software workbench.',
    'Allow several engineering instruments to operate side-by-side in one desktop workspace.',
    'Capture engineering data, settings, calibration state, provenance and project context automatically.',
    'Build a controlled verified-case knowledge base suitable for future recursive engineering-AI training.',
    'Integrate PCB/EDA, component, BOM and manufacturing workflows instead of ending the workflow after diagnosis.',
    'Preserve the AI PCB Matrix vision as a progressively developed autonomous PCB-design subsystem inside the larger platform.',
    'Maintain explicit safety, calibration and capability boundaries between simulator, prototype and released physical instruments.'
  ),
  jsonb_build_array(
    'Precision DC, high-speed oscilloscope, digital logic, RF, impedance and hazardous-voltage measurements cannot safely share one generic analog front end.',
    'Raw high-speed acquisition bandwidth exceeds practical host-link throughput unless FPGA buffering, triggering and decimation are used.',
    'Simulator data must never be confused with physical evidence or used as eligible AI-training evidence.',
    'Calibration state, hardware revision, firmware/RTL versions and data provenance must remain attached to engineering records.',
    'Hazardous-live field instrumentation requires dedicated isolation, protection, probes, spacing and independent certification rather than software limits or larger divider resistors.',
    'Autonomous PCB generation must progressively prove electrical correctness, manufacturability and validation before increasing autonomy.'
  ),
  'Frontier separated the system into a universal software layer and modular physical instrumentation layer. The current application uses a simulator-first hardware abstraction so interfaces, project workflows, logging and diagnostics can be developed without falsely claiming physical performance. Gen-1 divides control across STM32H743, ESP32-S3 and Artix-7 with dedicated precision ADC, scope ADC and AWG architectures. The same project model connects measurement sessions, component records, PCB/EDA work, manufacturing packages, reports and verified engineering cases. AI functionality is evidence-controlled: simulator cases remain ineligible for training, while the long-term AI PCB Matrix subsystem is treated as a staged engineering program with human review gates.',
  jsonb_build_object(
    'narrative','One engineering OS coordinates virtual instruments, project/session data, engineering intelligence, design/manufacturing workflows and modular physical instrumentation. Hardware capability is discovered rather than assumed, so the software can remain stable while measurement modules evolve.',
    'frontend','React 19 + TypeScript 7 + Vite 8 + Tailwind CSS 4 responsive engineering workspace with installable PWA behavior.',
    'backend','Current foundation is client-side/simulator-first. Physical-device control is abstracted through Frontier Instrument Protocol and a WebUSB adapter foundation; future connected services are separated from core instrument logic.',
    'database','Current foundation persists project/workspace state locally and defines controlled engineering-record/knowledge structures. Production data services will preserve project, calibration, provenance and consent boundaries as the platform matures.',
    'infrastructure','Vercel preview deployment, GitHub source control, acceptance-test gates, hardware-reference CI, Vivado release gates and native EDA/fabrication gates.',
    'services','Project/session service, hardware simulator and abstraction, instrument registry, data logger, Frontier Intelligence, knowledge base, EDA service, manufacturing service, component service and reporting.',
    'integrations','WebUSB physical-device adapter foundation; planned native KiCad/EasyEDA/Altium adapters; provider-neutral PCB manufacturing integrations; future modular Frontier Engineering Instruments hardware.'
  ),
  jsonb_build_array(
    jsonb_build_object('decision','Treat the software platform as the enduring product layer and physical instruments as modular capability providers.','reason','The engineer should not have to replace the user interface, project data model and workflow every time measurement hardware evolves.','benefit','Hardware generations can evolve independently while the engineering environment remains familiar and extensible.'),
    jsonb_build_object('decision','Use a simulator-first hardware abstraction during foundation development.','reason','Software workflows need to be built and tested before physical Gen-1 hardware exists.','benefit','The UI and data model can mature without inventing physical performance or hiding missing hardware.'),
    jsonb_build_object('decision','Separate high-rate acquisition into FPGA, deterministic control into STM32 and wireless supervision into ESP32-S3.','reason','No single controller is appropriate for precision measurement, high-rate acquisition, deterministic bus handling and wireless connectivity simultaneously.','benefit','Each processing layer is matched to the job it performs.'),
    jsonb_build_object('decision','Make verified engineering cases the basis for future recursive AI training.','reason','Engineering AI must learn from controlled evidence rather than unverified simulator output or unsupported conclusions.','benefit','Future diagnostic assistance can be grounded in provenance, measured outcomes and engineer-verified fault resolution.'),
    jsonb_build_object('decision','Incorporate AI PCB Matrix into Frontier Engineering OS instead of ending the vision.','reason','PCB design, manufacturing and engineering intelligence now belong naturally inside the broader measurement-to-manufacture environment.','benefit','The original natural-language-to-production-ready-PCB objective can mature as a first-class subsystem with access to project measurements, components, constraints and manufacturing context.')
  ),
  jsonb_build_array(
    'Multi-instrument desktop engineering workbench',
    'Collapsible instrument navigation and project-scoped layouts',
    'Digital multimeter interface',
    'Dual-channel oscilloscope interface',
    'Spectrum-analysis workspace',
    '8-channel logic-analyzer interface',
    'Signal generator / AWG interface',
    'Universal engineering data logger',
    'Projects and engineering sessions',
    'Frontier Intelligence live diagnostics framework',
    'Verified engineering knowledge base',
    'Controlled anonymized engineering-case dataset architecture',
    'Engineering reports and diagnostic/fault dossiers',
    'PCB & EDA workspace',
    'Component subsystem',
    'Engineering calculators',
    'Manufacturing/fabrication package workflow',
    'Provider-neutral manufacturing design',
    'Hardware abstraction and capability discovery',
    'Device Manager',
    'Frontier Instrument Protocol',
    'WebUSB physical-device adapter foundation',
    'PWA installation and responsive layouts',
    'Gen-1 modular hardware engineering package',
    'High-voltage generation/safety roadmap',
    'AI PCB Matrix Autonomous PCB Design Intelligence roadmap'
  ),
  jsonb_build_array(
    jsonb_build_object('challenge','Multiple standalone instruments duplicate displays, controls and project context.','response','Use one persistent software workbench with virtual instruments backed by modular hardware capabilities.','outcome','DMM, scope, logic, spectrum, AWG and logging interfaces can coexist in one project workspace.'),
    jsonb_build_object('challenge','Engineering evidence is usually scattered across measurements, screenshots, notes and reports.','response','Make Project the primary entity and attach sessions, measurements, calibration/provenance, PCB work, manufacturing packages and reports.','outcome','The platform can retain one traceable engineering history rather than disconnected files.'),
    jsonb_build_object('challenge','AI assistance can become unsafe when training data is unverified or simulator-generated.','response','Introduce verified-case states, consent/privacy controls and permanent simulator exclusion from AI-training eligibility.','outcome','Future model training can be restricted to controlled engineering evidence.'),
    jsonb_build_object('challenge','The original AI PCB Matrix vision risked becoming redundant as PCB/EDA features entered the larger platform.','response','Retain AI PCB Matrix as the integrated Autonomous PCB Design Intelligence R&D program instead of a separate duplicate product.','outcome','The text-to-production-ready-PCB objective survives and gains access to measurement, diagnostics, component and manufacturing context.')
  ),
  jsonb_build_array(
    'New projects default to LOCAL_ONLY privacy.',
    'Simulator-generated engineering cases are permanently excluded from AI-training eligibility.',
    'Physical and simulated data sources are distinguished in the hardware/data contracts.',
    'Gen-1 is explicitly low-voltage bench prototype architecture with no CAT rating or direct-mains claim.',
    'High-voltage field capability is deferred to independently tested/certified future generations.',
    'Strict TypeScript and acceptance tests protect architectural invariants.',
    'Hardware contracts use fail-closed rail, FPGA and module validation principles.',
    'Unimplemented EDA/manufacturing capabilities are labeled foundation/planned rather than falsely presented as operational.'
  ),
  'The application is structured around registries, provider abstractions, projects and modular services so new instruments and hardware generations can be added without replacing the overall engineering environment. FPGA buffering/decimation is part of the high-rate acquisition architecture rather than assuming unlimited host bandwidth. Project-scoped workspaces and controlled engineering records provide the basis for larger datasets and future collaborative/AI services.',
  'The desktop experience is designed as an engineering workbench rather than a sequence of isolated pages. Multiple instruments can be displayed together, the sidebar collapses into an icon rail to recover workspace width, and mobile/tablet layouts adapt to smaller displays. Simulator/foundation labels remain visible so users can distinguish demonstration state from connected physical hardware.',
  jsonb_build_object(
    'Application', jsonb_build_array('React 19','TypeScript 7','Vite 8','Tailwind CSS 4','Motion','Progressive Web App'),
    'Engineering Core', jsonb_build_array('Hardware Abstraction Layer','Instrument Registry','Project/Session Service','Data Logger','Frontier Intelligence','Verified Knowledge Base','EDA Service','Manufacturing Service'),
    'Physical Interface', jsonb_build_array('Frontier Instrument Protocol','WebUSB Adapter Foundation','STM32H743','ESP32-S3','AMD Artix-7 XC7A35T'),
    'Measurement Architecture', jsonb_build_array('ADS1262 Precision ADC','AD9238-65 Dual Scope ADC','AD9744 AWG DAC'),
    'Reference Validation', jsonb_build_array('Strict TypeScript','Acceptance Tests','GitHub Actions','CMake/GCC Firmware Reference','SystemVerilog/Icarus Reference Simulation','Vivado Release Gates')
  ),
  'In development. The software foundation and installable PWA preview are operational. The Gen-1 Rev-A repository engineering package is complete for whole-system review, but physical hardware has not yet been fabricated, calibrated or certified. Native PCB CAD, Vivado physical validation, final STM32 BSP, fabrication and laboratory validation remain external release gates.',
  'The key architectural insight is that the engineer should work inside one persistent environment while measurement hardware, AI capability and manufacturing integrations evolve underneath it. The same principle now preserves AI PCB Matrix: its goal was never merely to sit on top of existing PCB tools, but to mature toward AI-generated production-ready electronics from a textual engineering description. Frontier Engineering OS gives that vision a broader context because future autonomous PCB reasoning can draw on measured waveforms, diagnosed faults, verified components, project constraints and manufacturing requirements before proposing a design.',
  jsonb_build_array(
    jsonb_build_object(
      'id','frontier-engineering-os-live-preview',
      'date','2026-10-03',
      'type','external_project_link',
      'title','Frontier Engineering OS live software preview',
      'status','approved_for_publication',
      'sourceUrl',NULL,
      'attribution','Frontier DevConsults',
      'description','Public Vercel preview of the current simulator-first engineering workspace and installable PWA foundation.',
      'externalUrl','https://frontier-engineering-os-liard.vercel.app',
      'clientAttribution',NULL,
      'verificationState','verified',
      'publicationPermission',TRUE
    )
  ),
  jsonb_build_array('overview','problem','objectives','challenges','approach','architecture','decisions','capabilities','solutions','security','performance','ux','technology','gallery','results','status','insights'),
  'Frontier Engineering OS | Unified Instrumentation, Engineering AI, PCB & Manufacturing Platform',
  'Frontier DevConsults case study for a unified engineering OS combining instrumentation, diagnostics, verified engineering data, AI intelligence, PCB/EDA, manufacturing workflows and modular hardware architecture.',
  now(),
  now()
FROM public.projects p
WHERE p.slug = 'frontier-engineering-os'
ON CONFLICT (project_id) DO UPDATE SET
  app_id = NULL,
  slug = EXCLUDED.slug,
  ownership_type = EXCLUDED.ownership_type,
  commercial_state = EXCLUDED.commercial_state,
  client_commercial_authorized = EXCLUDED.client_commercial_authorized,
  visibility = EXCLUDED.visibility,
  executive_summary = EXCLUDED.executive_summary,
  intended_market = EXCLUDED.intended_market,
  engineering_responsibility = EXCLUDED.engineering_responsibility,
  problem_opportunity = EXCLUDED.problem_opportunity,
  objectives = EXCLUDED.objectives,
  challenges_constraints = EXCLUDED.challenges_constraints,
  engineering_approach = EXCLUDED.engineering_approach,
  architecture = EXCLUDED.architecture,
  engineering_decisions = EXCLUDED.engineering_decisions,
  capabilities = EXCLUDED.capabilities,
  problems_solutions = EXCLUDED.problems_solutions,
  security_reliability = EXCLUDED.security_reliability,
  performance_scalability = EXCLUDED.performance_scalability,
  user_experience = EXCLUDED.user_experience,
  technology_architecture = EXCLUDED.technology_architecture,
  project_status = EXCLUDED.project_status,
  engineering_insights = EXCLUDED.engineering_insights,
  evidence = EXCLUDED.evidence,
  section_order = EXCLUDED.section_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  published_at = COALESCE(public.case_studies.published_at, now()),
  updated_at = now();

COMMIT;
