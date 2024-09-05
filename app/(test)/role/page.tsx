"use client";
import DateTimeDisplay from "@/components/TimeConverter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useGetRole from "@/hooks/useGetRole";
import useGetUser from "@/hooks/useGetUser";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

export default function Page() {
	const router = useRouter();
	const params = useSearchParams(); // Get the query parameters
	const id = params.get("id"); // Extract the ID from the parameters
	if (!id) return <div className="pt-20">Need Id</div>;
	const { data, error, loading } = useGetRole(id || "");
	const { userData, userError, userLoading } = useGetUser();
	const [disable, setDisable] = useState(true);
	const { toast } = useToast();
	useEffect(() => {
		// Update the disable state once loading is finished
		if (!loading && userData !== null && userData.verified) {
			setDisable(false);
		} else {
			setDisable(true);
		}
	}, [loading, userData]); // Dependency array with loading and userData
	console.log(disable);

	if (loading) {
		return <div>Loading...</div>; // Show loading state
	}

	if (error) {
		// Render the error message, assuming error is an object
		return <div>Error: An error occurred</div>;
	}

	if (!data || data.length === 0) {
		return <div>No role found for ID {id}</div>; // Handle no data case
	}

	async function handleInterviewStart() {
		const id = v4(); // Generate a unique ID for the interview
		const mockId = `/interview-ai/${id}`;

		async function handleAdd() {
			try {
				const response = await fetch(
					process.env.NEXT_PUBLIC_WS + "/setDescription",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							description: data.description,
							meetingRoomId: mockId,
							roleId: data.id,
							email: userData.email,
						}),
					}
				);

				// Check if the response was successful (status code 200-299)
				if (response.ok) {
					router.push(mockId); // Only push the route on success
				} else {
					const errorData = await response.json();
					throw new Error(
						errorData.message || "Failed to create Interview"
					);
				}
			} catch (error: any) {
				console.log("Error:", error);
				toast({
					title: "Error creating Interview",
					description: error.message || "Something went wrong",
				});
			}
		}

		handleAdd(); // Call the function to add the interview
	}

	return (
		<div className="pt-20 flex justify-center items-center">
			<div className="p-10 mx-4 shadow-lg rounded-lg max-w-6xl">
				<Link
					href={"/org?id=" + data.organizationId}
					className="flex gap-3 text-xl items-center">
					<Avatar>
						<AvatarImage
							src={data?.organization.imageUrl ?? undefined}
						/>
						<AvatarFallback>
							{data?.organization.name?.charAt(0).toUpperCase() ??
								undefined}
						</AvatarFallback>
					</Avatar>
					<div>{data?.organization.name}</div>
				</Link>

				<CardTitle className="text-4xl font-normal text-center text-gray-800 mb-6">
					<span className="font-semibold">Role:</span> {data.name}
				</CardTitle>
				<CardContent className="text-left text-xl text-gray-700">
					<div className="mb-6">
						<div className="text-lg mb-2">
							<span className="font-semibold">Created:</span>{" "}
							{DateTimeDisplay(data.createdAt).slice(0, 10)}
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">Last Updated:</span>{" "}
							{DateTimeDisplay(data.updatedAt).slice(0, 10)}
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">
								Min Experience:
							</span>{" "}
							{data.experience} years
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">Min CGPA:</span>{" "}
							{data.cgpa}
						</div>
						<div className="text-lg mb-2">
							<span className="font-semibold">
								Min ATS Score:
							</span>{" "}
							{data.atsScore}
						</div>
					</div>
					<div className="text-lg leading-relaxed">
						{data.description}
					</div>
				</CardContent>
				{disable ? (
					<>
						<Link href={"/user/create"}>
							<Button>Add Your Details</Button>
						</Link>
					</>
				) : (
					<>
						<Button onClick={handleInterviewStart}>
							Take the Interview
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
