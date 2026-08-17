import { useState } from "react";
import { createCategory } from "../../api/productServiceApi";
import Button from "../ui/button";

export default function CategoryModal({ close, refresh }) {
	const [form, setForm] = useState({ name: "", brandName: "" });

	const submit = async () => {
		await createCategory(form);
		refresh();
		close();
	};

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
			<div className="bg-white p-6 rounded-xl w-96">
				<h2 className="font-bold text-xl mb-5">Create Category</h2>

				<input
					className="border p-3 w-full mb-3 rounded"
					placeholder="Category name"
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>

				<input
					className="border p-3 w-full mb-5 rounded"
					placeholder="Brand name"
					onChange={(e) => setForm({ ...form, brandName: e.target.value })}
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