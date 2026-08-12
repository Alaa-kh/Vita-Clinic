import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button/Button'
import { getSocket } from '@/shared/realtime/socket'
import styles from '@/features/platform/pages/Platform.module.scss'

const ROOM = 'barq-call'

export function CallPage() {
  const { t } = useTranslation()
  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState('idle')
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    socket.emit('webrtc:join', ROOM)

    const onSignal = async (payload: { from: string; signal: RTCSessionDescriptionInit | RTCIceCandidateInit }) => {
      const pc = pcRef.current
      if (!pc) return
      if ('type' in payload.signal && payload.signal.type) {
        await pc.setRemoteDescription(payload.signal as RTCSessionDescriptionInit)
        if (payload.signal.type === 'offer') {
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('webrtc:signal', { roomId: ROOM, signal: answer })
        }
      } else if ('candidate' in payload.signal) {
        try {
          await pc.addIceCandidate(payload.signal as RTCIceCandidateInit)
        } catch {
          // ignore late candidates
        }
      }
    }

    const onPeerJoined = async () => {
      const pc = pcRef.current
      if (!pc) return
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('webrtc:signal', { roomId: ROOM, signal: offer })
      setStatus('calling')
    }

    socket.on('webrtc:signal', onSignal)
    socket.on('webrtc:peer-joined', onPeerJoined)

    return () => {
      socket.off('webrtc:signal', onSignal)
      socket.off('webrtc:peer-joined', onPeerJoined)
      pcRef.current?.close()
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const start = async (video: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video })
    localStreamRef.current = stream
    if (localRef.current) localRef.current.srcObject = stream

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    pcRef.current = pc
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    pc.ontrack = (event) => {
      if (remoteRef.current) remoteRef.current.srcObject = event.streams[0] ?? null
      setStatus('connected')
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        getSocket().emit('webrtc:signal', { roomId: ROOM, signal: event.candidate })
      }
    }

    setStatus(video ? 'video-ready' : 'voice-ready')
  }

  const shareScreen = async () => {
    const display = await navigator.mediaDevices.getDisplayMedia({ video: true })
    const track = display.getVideoTracks()[0]
    const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video')
    if (track && sender) {
      await sender.replaceTrack(track)
      if (localRef.current) localRef.current.srcObject = display
    }
  }

  const toggleMute = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0]
    if (!audio) return
    audio.enabled = !audio.enabled
    setMuted(!audio.enabled)
  }

  const toggleCam = () => {
    const video = localStreamRef.current?.getVideoTracks()[0]
    if (!video) return
    video.enabled = !video.enabled
    setCamOff(!video.enabled)
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.call')}</p>
        <h1>{t('call.title')}</h1>
        <p>{t('call.subtitle')}</p>
      </header>

      <div className={styles.videoStage}>
        <div className={styles.videoBox}>
          <video ref={remoteRef} autoPlay playsInline />
        </div>
        <div className={styles.grid}>
          <div className={styles.videoBox}>
            <video ref={localRef} autoPlay muted playsInline />
          </div>
          <div className={styles.panel}>
            <p className={styles.muted}>{t('call.status', { status })}</p>
            <div className={styles.actions}>
              <Button type="button" onClick={() => void start(true)}>
                {t('call.video')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void start(false)}>
                {t('call.voice')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void shareScreen()}>
                {t('call.share')}
              </Button>
              <Button type="button" variant="secondary" onClick={toggleMute}>
                {muted ? t('call.unmute') : t('call.mute')}
              </Button>
              <Button type="button" variant="secondary" onClick={toggleCam}>
                {camOff ? t('call.camOn') : t('call.camOff')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
