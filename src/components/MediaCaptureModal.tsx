import { Camera, Check, Mic, RefreshCw, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface MediaCaptureModalProps {
	isOpen: boolean
	onClose: () => void
	onCapture: (type: 'image' | 'audio', data: string) => void
	initialType: 'image' | 'audio'
}

export function MediaCaptureModal({
	isOpen,
	onClose,
	onCapture,
	initialType,
}: MediaCaptureModalProps) {
	const { t } = useTranslation()
	const [type, setType] = useState<'image' | 'audio'>(initialType)
	const [capturedImage, setCapturedImage] = useState<string | null>(null)

	// Sync internal type state with prop when modal opens
	useEffect(() => {
		if (isOpen) {
			setType(initialType)
		}
	}, [isOpen, initialType])

	const {
		isRecording,
		transcription,
		start: startVoice,
		stop: stopVoice,
		reset: resetVoice,
	} = useVoiceRecognition()

	const videoRef = useRef<HTMLVideoElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const stopCamera = useCallback(() => {
		if (videoRef.current?.srcObject) {
			const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
			for (const track of tracks) {
				track.stop()
			}
		}
	}, [])

	const startCamera = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user' },
			})
			if (videoRef.current) {
				videoRef.current.srcObject = stream
			}
		} catch (err) {
			console.error('Error accessing camera:', err)
		}
	}, [])

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				setCapturedImage(e.target?.result as string)
				stopCamera()
			}
			reader.readAsDataURL(file)
		}
	}

	useEffect(() => {
		if (isOpen && type === 'image') {
			startCamera()
		}
		return () => stopCamera()
	}, [isOpen, type, stopCamera, startCamera])

	const takePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const context = canvasRef.current.getContext('2d')
			canvasRef.current.width = videoRef.current.videoWidth
			canvasRef.current.height = videoRef.current.videoHeight

			if (context) {
				// Flip horizontally to match the mirrored preview
				context.scale(-1, 1)
				context.drawImage(videoRef.current, -canvasRef.current.width, 0)
			}

			const data = canvasRef.current.toDataURL('image/png')
			setCapturedImage(data)
			stopCamera()
		}
	}

	const handleConfirm = () => {
		if (type === 'image' && capturedImage) {
			onCapture('image', capturedImage)
		} else if (type === 'audio' && transcription) {
			onCapture('audio', transcription)
		}
		onClose()
		reset()
	}

	const reset = () => {
		setCapturedImage(null)
		resetVoice()
		if (type === 'image') startCamera()
	}

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
			title={type === 'image' ? t('media.photo_title') : t('media.audio_title')}
		>
			<div className="space-y-4 py-4">
				<div className="mx-auto flex w-fit rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
					<Button
						variant={type === 'image' ? 'primary' : 'ghost'}
						size="sm"
						onClick={() => setType('image')}
					>
						<Camera className="mr-2 h-4 w-4" />
						{t('media.photo_tab')}
					</Button>
					<Button
						variant={type === 'audio' ? 'primary' : 'ghost'}
						size="sm"
						onClick={() => setType('audio')}
					>
						<Mic className="mr-2 h-4 w-4" />
						{t('media.audio_tab')}
					</Button>
				</div>

				<div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 dark:border-slate-800">
					{type === 'image' ? (
						<>
							{!capturedImage ? (
								<>
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted
										className="h-full w-full scale-x-[-1] object-cover"
									>
										<track kind="captions" />
									</video>
									<div className="absolute right-0 bottom-4 left-0 flex justify-center gap-2">
										<Button size="sm" onClick={takePhoto}>
											<Camera className="mr-2 h-4 w-4" />
											{t('media.start_recording')}
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => fileInputRef.current?.click()}
										>
											<Upload className="mr-2 h-4 w-4" />
											Upload
										</Button>
										<input
											type="file"
											ref={fileInputRef}
											accept="image/*"
											onChange={handleFileUpload}
											className="hidden"
										/>
									</div>
								</>
							) : (
								<img
									src={capturedImage}
									alt="Captured"
									className="h-full w-full object-contain"
								/>
							)}
							<canvas ref={canvasRef} className="hidden" />
						</>
					) : (
						<div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
							<p className="min-h-[1.5em] font-medium text-slate-300 text-sm">
								{isRecording
									? t('media.listening')
									: t('media.ready_to_record')}
							</p>
							<div className="mt-4 max-h-40 w-full overflow-y-auto rounded-lg bg-white/10 p-4 text-left font-sans text-sm backdrop-blur-sm">
								{transcription ? (
									<span className="leading-relaxed">{transcription}</span>
								) : (
									<span className="text-slate-500 italic">
										{t('media.placeholder')}
									</span>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-center gap-4">
					{type === 'image' ? (
						capturedImage && (
							<>
								<Button variant="outline" onClick={reset}>
									<RefreshCw className="mr-2 h-4 w-4" />
									{t('common.retry')}
								</Button>
								<Button variant="success" onClick={handleConfirm}>
									<Check className="mr-2 h-4 w-4" />
									{t('common.save')}
								</Button>
							</>
						)
					) : (
						<>
							{!isRecording ? (
								<Button onClick={startVoice} size="lg">
									{t('media.start_listening')}
								</Button>
							) : (
								<Button variant="danger" onClick={stopVoice} size="lg">
									{t('media.stop_listening')}
								</Button>
							)}
							{transcription && !isRecording && (
								<Button variant="success" onClick={handleConfirm}>
									<Check className="mr-2 h-4 w-4" />
									{t('media.save_text')}
								</Button>
							)}
						</>
					)}
				</div>
			</div>
		</Modal>
	)
}
