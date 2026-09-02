import { ClientStatus } from '../config/statusConfig';

// Whether the SUPERVISOR 50% (LEVEL_4) convenience default should be applied,
// given the status the form held a moment ago and the one it holds now.
//
// The default exists to save a click when a user *picks* SUPERVISOR, so it
// must fire only on a real transition into SUPERVISOR — never on the initial
// render of an edit form for a node that is already a SUPERVISOR. Firing on
// mount would silently overwrite that node's stored level (including an unset
// one, which is a deliberate "don't show me in a house" choice) with 50% the
// moment the user opened the form to look at it.
//
//   previous            next                applies?
//   ------------------  ------------------  --------
//   CLIENT              SUPERVISOR          yes  (user picked it)
//   SUPERVISOR          SUPERVISOR          no   (mount, or an unrelated edit)
//   SUPERVISOR          CLIENT              no   (leaving the status)
//   CLIENT              CLIENT              no
export const shouldApplySupervisorLevelDefault = (
  previousStatus: string | undefined,
  nextStatus: string | undefined
): boolean => nextStatus === ClientStatus.SUPERVISOR && previousStatus !== ClientStatus.SUPERVISOR;
