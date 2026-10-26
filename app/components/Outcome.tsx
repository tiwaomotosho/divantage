// "What changed for you?" (doc 24 §11 outcome prompt): the product's own result measure, kept on the device and
// never shown publicly as a claim.
import { Icon, toast } from "./da";
import { retentionActions, useRetention } from "../lib/store";

const OPTIONS = ["Got a customer", "Saved time", "Learned something", "Earned money", "Nothing yet", "Other"];

export function OutcomePrompt({ id, label }: { id: string; label: string }) {
  const ret = useRetention();
  const chosen = ret?.outcomes.find((o) => o.key === id)?.value;
  return (
    <div className="card soft pad" style={{ marginTop: 16 }} data-da="outcome-prompt">
      <div className="row g8 b7 t-sm">
        <Icon name="sparkles" /> What changed for you?
      </div>
      <div className="row g8 wrapf" style={{ marginTop: 10 }}>
        {OPTIONS.map((o) => (
          <button
            key={o}
            type="button"
            className={`chip sm ${chosen === o ? "sel" : ""}`}
            aria-pressed={chosen === o}
            onClick={() => {
              retentionActions.outcome(id, label, o);
              toast("Thanks. Saved on this device.");
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
