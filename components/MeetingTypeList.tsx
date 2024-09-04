/* eslint-disable camelcase */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import HomeCard from "./HomeCard";
import MeetingModal from "./MeetingModal";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import Loader from "./Loader";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { v4 } from "uuid";
import { useSendSpeech } from "@/hooks/useSendSpeech";

const initialValues = {
	dateTime: new Date(),
	description: "",
	link: "",
};

const MeetingTypeList = () => {
	const router = useRouter();
	const [meetingState, setMeetingState] = useState<
		| "isScheduleMeeting"
		| "isJoiningMeeting"
		| "isInstantMeeting"
		| "isMockInterview"
		| undefined
	>(undefined);
	const [values, setValues] = useState(initialValues);
	const [callDetail, setCallDetail] = useState<Call>();
	const client = useStreamVideoClient();
	const { user } = useUser();
	const { toast } = useToast();
	let [mode, setMode] = useState<"interviewee" | "interviewer">(
		"interviewer"
	);

	const { joinRoom } = useSendSpeech();

	const createMeeting = async () => {
		if (!client || !user) return;
		try {
			if (!values.dateTime) {
				toast({ title: "Please select a date and time" });
				return;
			}
			const id = crypto.randomUUID();
			const call = client.call("default", id);
			if (!call) throw new Error("Failed to create meeting");
			const startsAt =
				values.dateTime.toISOString() ||
				new Date(Date.now()).toISOString();
			const description = values.description;
			await call.getOrCreate({
				data: {
					starts_at: startsAt,
					custom: {
						description,
					},
				},
			});
			setCallDetail(call);
			if (values.description) {
				router.push(`/meeting/${call.id}`);
				try {
					const response = await fetch(
						// "http://localhost:8000/setDescription",
						"https://interviewmate-atie.onrender.com/setDescription",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								description,
								meetingRoomId: `/meeting/${call.id}`,
							}),
						}
					);

					if (!response.ok) {
						throw new Error(
							`HTTP error! status: ${response.status}`
						);
					}

					const data = await response.json();
				} catch (error) {}
				toast({
					title: "Meeting Created",
				});
			} else {
				toast({
					title: "Need Description",
				});
			}
		} catch (error) {
			console.error(error);
			toast({ title: "Failed to create Meeting" });
		}
	};

	if (!client || !user) return <Loader />;

	const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

	// mock interview
	function getUserMail() {
		if (user?.emailAddresses[0]?.emailAddress) {
			return user.emailAddresses[0].emailAddress;
		}
		return "";
	}
	async function handleMockInterview() {
		if (values.description === "") {
			toast({
				title: "Need Description",
			});
		} else {
			const id = v4();
			const mockId = `/mock-interview/${id}`;

			try {
				const response = await fetch(
					// "http://localhost:8000/setDescription",
					"https://interviewmate-atie.onrender.com/setDescription",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							description: values.description,
							meetingRoomId: mockId,
						}),
					}
				);
				router.push(mockId);

				joinRoom(mockId, getUserMail());
			} catch (error) {
				console.log("Error:", error);
				toast({
					title: "Error creating Mock Interview",
				});
			}

			fetch(
				// "http://localhost:8000/setDescription",
				"https://interviewmate-atie.onrender.com/setDescription",
				{
					method: "POST",
					body: JSON.stringify({
						description: values.description,
						meetingRoomId: `/meeting/${id}`,
					}),
				}
			);

			toast({
				title: "Mock Interview Created",
			});
		}
	}

	return (
		<div>
			<Button
				className="bg-green-900 text-white"
				onClick={() => {
					setMode((prevMode) =>
						prevMode === "interviewer"
							? "interviewee"
							: "interviewer"
					);
				}}>
				Switch to {mode === "interviewee" ? "Interviwer" : "Interviwee"}
			</Button>
			{mode === "interviewer" ? (
				<section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
					<HomeCard
						img="/icons/add-meeting.svg"
						title="New Meeting"
						className="bg-green-600"
						description="Start an instant meeting"
						handleClick={() => setMeetingState("isInstantMeeting")}
					/>

					<HomeCard
						img="/icons/schedule.svg"
						title="Schedule Meeting"
						description="Plan your meeting"
						className="bg-green-600"
						handleClick={() => setMeetingState("isScheduleMeeting")}
					/>
					<HomeCard
						img="/icons/recordings.svg"
						title="View Recordings"
						description="Meeting Recordings"
						className="bg-green-600"
						handleClick={() => router.push("/recordings")}
					/>
				</section>
			) : (
				<section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
					<HomeCard
						img="/icons/join-meeting.svg"
						title="Join Meeting"
						description="via invitation link"
						className="bg-green-600"
						handleClick={() => setMeetingState("isJoiningMeeting")}
					/>
					<HomeCard
						img="/icons/add-meeting.svg"
						title="Mock Interview"
						className="bg-green-600"
						description="Practice for Interview"
						handleClick={() => setMeetingState("isMockInterview")}
					/>
				</section>
			)}
			{!callDetail ? (
				<MeetingModal
					isOpen={meetingState === "isScheduleMeeting"}
					onClose={() => setMeetingState(undefined)}
					title="Create Meeting"
					handleClick={createMeeting}>
					<div className="flex flex-col gap-2.5">
						<label className="text-base font-normal leading-[22.4px] text-sky-2">
							Add a description
						</label>
						<Textarea
							className="border-none  bg-white dark:bg-black focus-visible:ring-0 focus-visible:ring-offset-0"
							onChange={(e) =>
								setValues({
									...values,
									description: e.target.value,
								})
							}
						/>
					</div>
					<div className="flex w-full flex-col gap-2.5">
						<label className="text-base font-normal leading-[22.4px] text-sky-2">
							Select Date and Time
						</label>
						<ReactDatePicker
							selected={values.dateTime}
							onChange={(date) =>
								setValues({ ...values, dateTime: date! })
							}
							showTimeSelect
							timeFormat="HH:mm"
							timeIntervals={15}
							timeCaption="time"
							dateFormat="MMMM d, yyyy h:mm aa"
							className="w-full rounded bg-dark-3 p-2 focus:outline-none"
						/>
					</div>
				</MeetingModal>
			) : (
				<MeetingModal
					isOpen={meetingState === "isScheduleMeeting"}
					onClose={() => setMeetingState(undefined)}
					title="Meeting Created"
					handleClick={() => {
						navigator.clipboard.writeText(meetingLink);
						toast({ title: "Link Copied" });
					}}
					image={"/icons/checked.svg"}
					buttonIcon="/icons/copy.svg"
					className="text-center"
					buttonText="Copy Meeting Link"
				/>
			)}

			<MeetingModal
				isOpen={meetingState === "isJoiningMeeting"}
				onClose={() => setMeetingState(undefined)}
				title="Type the link here"
				className="text-center"
				buttonText="Join Meeting"
				handleClick={() => router.push(values.link)}>
				<Input
					placeholder="Meeting link"
					onChange={(e) =>
						setValues({ ...values, link: e.target.value })
					}
					className="border-none  bg-white dark:bg-black focus-visible:ring-0 focus-visible:ring-offset-0"
				/>
			</MeetingModal>

			<MeetingModal
				isOpen={meetingState === "isInstantMeeting"}
				onClose={() => setMeetingState(undefined)}
				title="Start an Instant Meeting"
				className="text-center"
				buttonText="Start Meeting"
				handleClick={createMeeting}>
				<div className="flex flex-col gap-2.5">
					<label className="text-base font-normal leading-[22.4px] text-sky-2">
						Add a description
					</label>
					<Textarea
						className="border bg-white dark:bg-black focus-visible:ring-0 focus-visible:ring-offset-0"
						onChange={(e) =>
							setValues({
								...values,
								description: e.target.value,
							})
						}
					/>
				</div>
			</MeetingModal>
			<MeetingModal
				isOpen={meetingState === "isMockInterview"}
				onClose={() => setMeetingState(undefined)}
				title="Start an Mock Interview"
				className="text-center"
				buttonText="Start"
				handleClick={handleMockInterview}>
				<div className="flex flex-col gap-2.5">
					<label className="text-base font-normal leading-[22.4px] text-sky-2">
						Add a description
					</label>
					<Textarea
						className="border bg-white dark:bg-black focus-visible:ring-0 focus-visible:ring-offset-0"
						onChange={(e) =>
							setValues({
								...values,
								description: e.target.value,
							})
						}
					/>
				</div>
			</MeetingModal>
		</div>
	);
};

export default MeetingTypeList;
