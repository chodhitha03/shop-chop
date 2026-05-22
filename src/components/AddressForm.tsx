import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AddressInput {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  initial?: AddressInput;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (value: AddressInput) => void;
  onCancel?: () => void;
}

const emptyAddress: AddressInput = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export const AddressForm = ({
  initial,
  submitLabel = "Save address",
  loading,
  onSubmit,
  onCancel,
}: AddressFormProps) => {
  const [form, setForm] = useState<AddressInput>(initial || emptyAddress);

  const updateField = (key: keyof AddressInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={form.label || ""}
          onChange={(event) => updateField("label", event.target.value)}
          placeholder="Home, Office"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="line1">Address line 1</Label>
        <Input
          id="line1"
          value={form.line1}
          onChange={(event) => updateField("line1", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="line2">Address line 2</Label>
        <Input
          id="line2"
          value={form.line2 || ""}
          onChange={(event) => updateField("line2", event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={form.city}
          onChange={(event) => updateField("city", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={form.state}
          onChange={(event) => updateField("state", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="postalCode">Postal code</Label>
        <Input
          id="postalCode"
          value={form.postalCode}
          onChange={(event) => updateField("postalCode", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={form.country}
          onChange={(event) => updateField("country", event.target.value)}
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.isDefault)}
          onChange={(event) => updateField("isDefault", event.target.checked)}
        />
        Set as default
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
