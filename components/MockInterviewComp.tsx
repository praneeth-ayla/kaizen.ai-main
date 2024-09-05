"use client";
import { useSendSpeech } from "@/hooks/useSendSpeech";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import useSpeechRecognition from "@/hooks/UseSpeechMock";

export default function MockInterviewComp() {
	const mockId = usePathname();
	const [mockDetails, setMockDetails] = useState<any>();
	const [questions, setQuestions] = useState<string[]>([]);
	const { needQuestions } = useSendSpeech();
	const [loading, setLoading] = useState(false);
	const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
	const [total, setTotal] = useState(0);
	const [count, setCount] = useState(0);
	const [timer, setTimer] = useState(300); // 5 minutes in seconds
	const router = useRouter();
	const [isSpeaking, setIsSpeaking] = useState("/listening.mp4");
	const [isMuted, setIsMuted] = useState(false);
	const [autoClickInterval, setAutoClickInterval] = useState<ReturnType<
		typeof setInterval
	> | null>(null);

	const {
		hasRecognitionSupport,
		isListening,
		startListening,
		stopListening,
		text,
		setText,
	} = useSpeechRecognition(isMuted);
	const { sendWS } = useSendSpeech();

	useEffect(() => {
		if (!hasRecognitionSupport) {
			alert("Speech recognition is not supported in this browser.");
		}
		getMockDetails();

		// Set up the interval to automatically click the button if not clicked in 5 minutes
		const interval = setInterval(() => {
			const button = document.querySelector(
				"button"
			) as HTMLButtonElement;
			if (button && !loading && questions.length > 0) {
				button.click();
			}
		}, 5 * 60 * 1000); // 5 minutes

		setAutoClickInterval(interval);

		return () => {
			if (autoClickInterval) {
				clearInterval(autoClickInterval);
			}
		};
	}, []);

	useEffect(() => {
		let timerInterval: ReturnType<typeof setInterval> | null = null;

		if (timer > 0 && count < questions.length) {
			timerInterval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		} else if (timer === 0) {
			handleNext();
		}

		return () => {
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		};
	}, [timer, count]);

	function speak(question: string) {
		const utterance = new SpeechSynthesisUtterance(question);
		utterance.onstart = () => setIsSpeaking("/speaking.mp4");
		utterance.onend = () => setIsSpeaking("/listening.mp4");

		const voices = speechSynthesis.getVoices();
		utterance.voice = voices[3]; // Choose a specific voice

		speechSynthesis.speak(utterance);
	}

	function handleWhenEmpty() {
		startListening();
		setLoading(true);
		needQuestions(mockId, "empty")
			.then((questions) => {
				const questionArray = Object.values(questions);
				setQuestions(questionArray);
				setLoading(false);
				setTimeout(() => {
					speak(questions[count + 1]);
					setTimer(300); // Reset timer
				}, 200);
			})
			.catch((error) => {
				console.error("Error fetching questions:", error);
				setLoading(false);
			});
	}

	function handleQuestionReq() {
		setLoading(true);
		needQuestions(mockId, "not")
			.then((questions) => {
				const questionArray = Object.values(questions);
				setQuestions(questionArray);
				setLoading(false);
				setCount(0);
				setTimer(300); // Reset timer
			})
			.catch((error) => {
				console.error("Error fetching questions:", error);
				setLoading(false);
			});
	}

	function handleNext() {
		setIsMuted((prev) => !prev);
		setIsMuted((prev) => !prev);

		sendWS({
			text: questions[count],
			role: "interviwer",
			meetingRoomId: mockId,
		});
		setTimeout(() => {
			sendWS({ text, role: "interviwee", meetingRoomId: mockId });
		}, 1000);
		setText("");
		if (count === 4) {
			handleQuestionReq();
		} else {
			setCount((c) => c + 1);
		}
		setPreviousQuestions((prev) => [...prev, questions[count]]);

		setTimeout(() => {
			speak(questions[count + 1]);
			setTimer(300); // Reset timer
		}, 400);

		if (autoClickInterval) {
			clearInterval(autoClickInterval);
			setAutoClickInterval(null);
		}
	}

	async function getMockDetails() {
		try {
			const response = await fetch(
				process.env.NEXT_PUBLIC_WS + "/meetingD",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ meetingRoomId: mockId }),
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setMockDetails(data.meetingDetails);
		} catch (error) {
			console.error("Fetch error:", error);
		}
	}

	async function handleEnd() {
		router.push("/home");
	}

	return (
		<div className="pt-20 px-10 sm:px-20 md:px-40 lg:px-20 xl:px-60">
			<div>
				<div>
					Id:{" "}
					<span className="text-muted-foreground">
						{mockId.slice(14)}
					</span>
				</div>
				<div className="flex justify-between items-center mt-5 h-[50vh] w-full">
					<div className="flex justify-center items-center w-full rounded-lg">
						<video
							src={isSpeaking || ""}
							controls={false}
							autoPlay
							playsInline
							className="object-cover object-center"
							loop
							muted
							height={300}
							width={300}></video>
					</div>
				</div>
				Time Left: {Math.floor(timer / 60)}:
				{("0" + (timer % 60)).slice(-2)}
				<div className="flex justify-between gap-4 mt-10">
					<div>
						<div className="font-bold">Question:</div>
						<div
							onClick={() => {
								speak(questions[count]);
							}}
							className="hover:cursor-pointer">
							{questions[count]}
						</div>
					</div>
					{total < 10 ? (
						<Button
							disabled={loading}
							className={loading ? "px-10" : ""}
							onClick={() => {
								setTotal(total + 1);
								setIsSpeaking("/speaking.mp4");
								{
									questions.length === 0
										? handleWhenEmpty()
										: handleNext();
								}
							}}>
							{!loading ? (
								<>
									{questions.length === 0
										? "Generate Question"
										: "Next Question"}
								</>
							) : (
								<Image
									src="/icons/loading-circle.svg"
									alt="Loading..."
									width={35}
									height={35}
								/>
							)}
						</Button>
					) : (
						<Button
							disabled={loading}
							variant="destructive"
							className={loading ? "px-10" : ""}
							onClick={() => {
								handleEnd();
							}}>
							{!loading ? (
								<>End Meeting</>
							) : (
								<Image
									src="/icons/loading-circle.svg"
									alt="Loading..."
									width={35}
									height={35}
								/>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
