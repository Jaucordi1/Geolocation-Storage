type WatchPosition = (options?: PositionOptions) => PositionSubscriber

interface Window {
	WatchPosition: WatchPosition
}
declare const WatchPosition: WatchPosition

const DEBUG = false
const LOG = (msg: string, ...params: any) => {
	if (DEBUG)
		console.log(`[GeolocStorage] ${msg}`, ...params)
}

const defaultOptions: Required<PositionOptions> = {
	timeout: 5000,
	maximumAge: 1000 * 60 * 5,
	enableHighAccuracy: true
}
type PositionSubscriberCallback = (position: Position, prevPosition?: Position) => void
class PositionSubscriber{
	private _options: Required<PositionOptions>
	private _lastLocation?: Position
	private _previousLocation?: Position
	private _listeners: PositionSubscriberCallback[] = []
	private _watchID?: number
	
	constructor(options?: Partial<PositionOptions>) {
		this._options = {...defaultOptions, ...options}
		this.init()
	}
	
	private init() {
		LOG("Initialisation du module de géolocalisation…")
		
		const savedJSON = localStorage.getItem('pos')
		if (savedJSON !== null){
			let pos: Position | undefined
			try {
				pos = JSON.parse(atob(savedJSON))
			} catch (e) {
				console.error("[GeolocStorage] Unable to parse saved JSON's position", savedJSON)
			}
			if (pos !== undefined)
				this._lastLocation = pos
		}
	}
	
	get watching() {
		return this._watchID !== undefined
	}
	get savedLocation() {
		return this._lastLocation
	}
	get previousLocation() {
		return this._previousLocation
	}
	
	private onReceiveLocation = (pos: Position) => {
		LOG("Position reçue", pos)
		
		const prev = this.saveLocation(pos)
		this._listeners.forEach(cb => cb(pos, prev))
	}
	private onLocationError = (err: PositionError) => {
		LOG("Erreur de position")
		switch (err.code) {
			case err.PERMISSION_DENIED:
				this.stopWatch()
				return console.error("[GeolocStorage] Unable to get location", err.message)
			case err.POSITION_UNAVAILABLE:
				return console.error("[GeolocStorage] Unable to get location", err.message)
			case err.TIMEOUT:
				return console.error("[GeolocStorage] Location fetch timed out", err.message)
			default:
				return console.error("[GeolocStorage] Unknown error", err.code, err.message)
		}
	}
	
	public subscribe = (callback: PositionSubscriberCallback) => {
		LOG("Adding new listener to geolocation module.")
		
		if (this._listeners.indexOf(callback) > -1) return
		this._listeners.push(callback)
		if (this._listeners.length > 0)
			this.watch()
	}
	public unsubscribe = (callback: PositionSubscriberCallback) => {
		LOG("Removing listener from geolocation module")
		
		if (this._listeners.indexOf(callback) === -1) return
		this._listeners = this._listeners.filter(listener => listener !== callback)
		if (this._listeners.length === 0)
			this.stopWatch()
	}
	public watch = () => {
		LOG("Start watching position asked…")
		if (!this.watching) {
			LOG(" watching position")
			this._watchID = navigator.geolocation.watchPosition(this.onReceiveLocation, this.onLocationError, this._options)
		}
	}
	public stopWatch = () => {
		if (this._watchID !== undefined) {
			LOG("Stop watching position")
			navigator.geolocation.clearWatch(this._watchID)
			this._watchID = undefined
		}
	}
	
	private saveLocation = (pos: Position) => {
		this._previousLocation = this._lastLocation
		this._lastLocation = pos
		localStorage.setItem('pos', btoa(JSON.stringify({
			timestamp: pos.timestamp,
			coords: {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				accuracy: pos.coords.accuracy,
				speed: pos.coords.speed,
				heading: pos.coords.heading,
				altitude: pos.coords.altitude,
				altitudeAccuracy: pos.coords.altitudeAccuracy
			}
		})))
		LOG("Position sauvegardée !", pos)
		LOG("Position précédente:", this._previousLocation)
		return this._previousLocation
	}
	private clearLocation = () => {
		localStorage.clear()
		LOG("Les données ont été supprimées du stockage local.")
	}
}

window.WatchPosition = options => new PositionSubscriber(options)
