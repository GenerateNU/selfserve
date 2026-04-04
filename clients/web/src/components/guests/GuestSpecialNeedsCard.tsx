type SpecialNeeds = {
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  sensorySensitivities: string;
  medicalConditions: string;
};

type GuestSpecialNeedsCardProps = {
  specialNeeds: SpecialNeeds;
};

function SpecialNeedsRow({ label, value }: { label: string; value: string }) {
  const displayValue = value.trim().length > 0 ? value : "-";
  return (
    <div className="grid grid-cols-[48%_1fr] py-[1vh] text-[1vw]">
      <p className="text-text-subtle">{label}</p>
      <p className={displayValue === "-" ? "text-text-subtle" : "text-black"}>
        {displayValue}
      </p>
    </div>
  );
}

export function GuestSpecialNeedsCard({
  specialNeeds,
}: GuestSpecialNeedsCardProps) {
  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      <h2 className="mb-[1vh] text-[2vw] font-medium text-black">
        Special Needs
      </h2>
      <SpecialNeedsRow
        label="Dietary Restrictions"
        value={specialNeeds.dietaryRestrictions}
      />
      <SpecialNeedsRow
        label="Accessibility Needs"
        value={specialNeeds.accessibilityNeeds}
      />
      <SpecialNeedsRow
        label="Sensory Sensitivities"
        value={specialNeeds.sensorySensitivities}
      />
      <SpecialNeedsRow
        label="Medical Conditions"
        value={specialNeeds.medicalConditions}
      />
    </section>
  );
}
