"use client";
import { useEffect, useState } from "react";
import {
	DeviceSettings,
	VideoPreview,
	useCall,
	useCallStateHooks,
} from "@stream-io/video-react-sdk";

import Alert from "./Alert";
import { Button } from "./ui/button";
import { useSendSpeech } from "@/hooks/useSendSpeech";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const MeetingSetup = ({
	setIsSetupComplete,
}: {
	setIsSetupComplete: (value: boolean) => void;
}) => {
	// https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
	const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
	const callStartsAt = useCallStartsAt();
	const callEndedAt = useCallEndedAt();
	const callTimeNotArrived =
		callStartsAt && new Date(callStartsAt) > new Date();
	const callHasEnded = !!callEndedAt;
	const meetingId = usePathname();
	const searchParams = useSearchParams();
	const isPersonalRoom = !!searchParams.get("personal");

	const { user } = useUser();
	function getUserMail() {
		if (user?.emailAddresses[0].emailAddress) {
			return user?.emailAddresses[0].emailAddress;
		}
		return "";
	}
	const call = useCall();

	const { joinRoom } = useSendSpeech();

	if (!call) {
		throw new Error(
			"useStreamCall must be used within a StreamCall component."
		);
	}

	// https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
	const [isMicCamToggled, setIsMicCamToggled] = useState(false);

	useEffect(() => {
		if (isMicCamToggled) {
			call.camera.disable();
			call.microphone.disable();
		} else {
			call.camera.enable();
			call.microphone.enable();
		}
	}, [isMicCamToggled, call.camera, call.microphone]);

	if (callTimeNotArrived)
		return (
			<Alert
				title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
			/>
		);

	if (callHasEnded)
		return (
			<div className="flex justify-center items-center">
				<Alert
					title="The call has been ended by the host"
					iconUrl="/icons/logo.svg"
				/>
			</div>
		);

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-3">
			<h1 className="text-center text-2xl font-bold">Setup</h1>
			<div className="">
				<VideoPreview />
			</div>
			<div className="flex h-16 items-center justify-center gap-3">
				<label className="flex items-center justify-center gap-2 font-medium">
					<input
						type="checkbox"
						checked={isMicCamToggled}
						onChange={(e) => setIsMicCamToggled(e.target.checked)}
					/>
					Join with mic and camera off
				</label>
				<div className="text-white">
					<DeviceSettings />
				</div>
			</div>
			<Button
				className="rounded-md bg-green-500 px-4 py-2.5"
				onClick={() => {
					call.join();
					{
						!isPersonalRoom && joinRoom(meetingId, getUserMail());
					}
					setIsSetupComplete(true);
				}}>
				Join meeting
			</Button>
		</div>
	);
};

export default MeetingSetup;
