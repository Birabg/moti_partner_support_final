import { useState } from "react";
import { createServiceType } from "../../api/productServiceApi";
import Button from "../ui/button";

export default function ServiceTypeModal({ close, refresh }) {
  const [name, setName] = useState("");

  const submit = async () => {
    try {
      await createServiceType({ name });
      refresh();
      close();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-5">Create Service Type</h2>

        <input
          className="border p-3 w-full mb-5 rounded"
          placeholder="Service type name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex items-center">
          <Button onClick={submit} variant="accent">
            Save
          </Button>
          <Button onClick={close} variant="outline" className="ml-3">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
