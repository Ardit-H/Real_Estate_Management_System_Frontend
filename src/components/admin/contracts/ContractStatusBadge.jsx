// src/components/admin/contracts/ContractStatusBadge.jsx

import { STATUS_LABELS } from "./contractsHelpers";

export default function ContractStatusBadge({ status }) {
  return (
    <span className={`lc-badge lc-badge-${status}`}>
      <span className="lc-badge-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}