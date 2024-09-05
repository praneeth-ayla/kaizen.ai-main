"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";

interface EntryDetails {
	name: string;
	atsScore?: any;
	cgpa?: any;
	experience?: any;
}

export default function EntryDetailsPage() {
	const [formData, setFormData] = useState<EntryDetails>({
		name: "",
		atsScore: undefined,
		cgpa: undefined,
		experience: undefined,
	});
	const [errors, setErrors] = useState<Partial<EntryDetails>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const router = useRouter();
	// Get User Details
	const { user } = useUser();
	function getUserMail() {
		if (user?.emailAddresses[0].emailAddress) {
			return user?.emailAddresses[0].emailAddress;
		}
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		if (validateForm()) {
			setIsSubmitting(true);

			try {
				const response = await axios.post(
					process.env.NEXT_PUBLIC_WS + "/user/create",
					{ ...formData, email: getUserMail() }
				);

				toast({
					title:
						response.data.message || "Entry created successfully",
				});
				router.back();
			} catch (error) {
				console.error("Error saving entry details:", error);
				toast({
					title: "An error occurred while saving the entry details.",
					variant: "destructive",
				});
			} finally {
				setIsSubmitting(false);
			}
		}
	}

	function validateForm() {
		const newErrors: Partial<EntryDetails> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required.";
		}

		if (
			formData.experience !== undefined &&
			(formData.experience < 0 || formData.experience > 100)
		) {
			newErrors.experience = "Experience must be between 0 and 100.";
		}

		if (
			formData.cgpa !== undefined &&
			(formData.cgpa < 0 || formData.cgpa > 10)
		) {
			newErrors.cgpa = "CGPA must be between 0 and 10.";
		}

		if (
			formData.atsScore !== undefined &&
			(formData.atsScore < 0 || formData.atsScore > 99)
		) {
			newErrors.atsScore = "ATS Score must be between 0 and 99.";
		}

		setErrors(newErrors);

		return Object.keys(newErrors).length === 0;
	}

	const handleNumberChange =
		(field: keyof EntryDetails) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			const numberValue = value === "" ? undefined : Number(value);
			setFormData({ ...formData, [field]: numberValue });
		};

	const handleTextChange =
		(field: keyof EntryDetails) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData({ ...formData, [field]: e.target.value });
		};

	return (
		<div className="container mx-auto p-4">
			<Card>
				<CardHeader>
					<h2 className="text-xl font-semibold">Add Entry</h2>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={handleTextChange("name")}
								aria-invalid={errors.name ? "true" : undefined}
								className="mt-1 block w-full"
							/>
							{errors.name && (
								<p className="text-red-500 text-sm mt-1">
									{errors.name}
								</p>
							)}
						</div>
						<div className="mb-4">
							<Label htmlFor="experience">
								Experience (years)
							</Label>
							<Input
								type="number"
								id="experience"
								value={
									formData.experience !== undefined
										? formData.experience
										: ""
								}
								onChange={handleNumberChange("experience")}
								min={0}
								max={100}
								placeholder="e.g., 3"
								className="mt-1 block w-full"
							/>
							{errors.experience && (
								<p className="text-red-500 text-sm mt-1">
									{errors.experience}
								</p>
							)}
						</div>
						<div className="mb-4">
							<Label htmlFor="cgpa">CGPA (Points)</Label>
							<Input
								type="number"
								id="cgpa"
								value={
									formData.cgpa !== undefined
										? formData.cgpa
										: ""
								}
								onChange={handleNumberChange("cgpa")}
								min={0}
								max={10}
								step="0.1"
								placeholder="e.g., 8.5"
								className="mt-1 block w-full"
							/>
							{errors.cgpa && (
								<p className="text-red-500 text-sm mt-1">
									{errors.cgpa}
								</p>
							)}
						</div>
						<div className="mb-4">
							<Label htmlFor="atsScore">
								ATS Score (Percentage)
							</Label>
							<Input
								type="number"
								id="atsScore"
								value={
									formData.atsScore !== undefined
										? formData.atsScore
										: ""
								}
								onChange={handleNumberChange("atsScore")}
								min={0}
								max={99}
								placeholder="e.g., 75"
								className="mt-1 block w-full"
							/>
							{errors.atsScore && (
								<p className="text-red-500 text-sm mt-1">
									{errors.atsScore}
								</p>
							)}
						</div>
						<Button
							type="submit"
							disabled={isSubmitting}>
							{isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
