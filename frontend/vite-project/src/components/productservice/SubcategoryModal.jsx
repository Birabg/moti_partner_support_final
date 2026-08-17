import { useEffect, useState } from "react";
import { createSubcategory, getCategories } from "../../api/productServiceApi";
import Button from "../ui/button";

export default function SubcategoryModal({ close, refresh }) {
	const [categories, setCategories] = useState([]);
	const [form, setForm] = useState({ name: "", productCategoryId: "" });

	useEffect(() => {
		const loadCategories = async () => {
			try {
				const res = await getCategories();
				setCategories(res.data?.data || []);
			} catch (err) {
				console.log(err);
			}
		};

		loadCategories();
	}, []);

	const submit = async () => {
		try {
			await createSubcategory(form);
			refresh();
			close();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
			<div className="bg-white p-6 rounded-xl w-96">
				<h2 className="text-xl font-bold mb-5">Create Subcategory</h2>

				<select
					className="border p-3 w-full mb-3 rounded"
					onChange={(e) => setForm({ ...form, productCategoryId: e.target.value })}
				>
					<option value="">Select Category</option>
					{categories.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>

				<input
					className="border p-3 w-full mb-5 rounded"
					placeholder="Subcategory name"
					onChange={(e) => setForm({ ...form, name: e.target.value })}
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