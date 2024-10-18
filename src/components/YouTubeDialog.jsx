import React, {useState, useCallback, useEffect, useRef} from 'react'
import {Button} from "./ui/button"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./ui/dialog"
import {Input} from "./ui/input"
import {ScrollArea} from "./ui/scroll-area"
import {Search, Loader2} from 'lucide-react'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000
const RESULTS_PER_PAGE = 10

export default function YouTubeDialog({isOpen, onClose, onSelect}) {
    const [youtubeSearch, setYoutubeSearch] = useState('')
    const [youtubeResults, setYoutubeResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [nextPageToken, setNextPageToken] = useState('')
    const observer = useRef(null)
    const lastVideoElementRef = useRef(null)

    const getFromCache = (key) => {
        const cached = localStorage.getItem(key)
        if (cached) {
            const {data, timestamp} = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_EXPIRATION) {
                return data
            }
        }
        return null
    }

    const setInCache = (key, data) => {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }))
    }

    const handleYoutubeSearch = useCallback(async (searchTerm, pageToken = '') => {
        if (searchTerm && YOUTUBE_API_KEY) {
            setIsLoading(true)
            setNoResults(false)

            const cacheKey = `youtube-search-${searchTerm}-${pageToken}`
            const cachedResult = getFromCache(cacheKey)

            if (cachedResult) {
                setYoutubeResults(prevResults => pageToken ? [...prevResults, ...cachedResult.items] : cachedResult.items)
                setNextPageToken(cachedResult.nextPageToken)
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=${RESULTS_PER_PAGE}${pageToken ? `&pageToken=${pageToken}` : ''}`)
                const data = await response.json()

                const newResults = data.items || []
                setYoutubeResults(prevResults => pageToken ? [...prevResults, ...newResults] : newResults)
                setNextPageToken(data.nextPageToken || '')
                setNoResults(newResults.length === 0)

                setInCache(cacheKey, {
                    items: newResults,
                    nextPageToken: data.nextPageToken
                })
            } catch (error) {
                console.error('Error al buscar videos de YouTube:', error)
                setYoutubeResults([])
                setNoResults(true)
            } finally {
                setIsLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            setYoutubeSearch('')
            setYoutubeResults([])
            setNoResults(false)
            setNextPageToken('')
        }
    }, [isOpen])

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextPageToken) {
                    handleYoutubeSearch(youtubeSearch, nextPageToken)
                }
            },
            {threshold: 1.0}
        )

        if (lastVideoElementRef.current) {
            observer.current.observe(lastVideoElementRef.current)
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
        }
    }, [nextPageToken, youtubeSearch, handleYoutubeSearch])

    const handleYoutubeSelect = (video) => {
        const videoId = video.id.videoId
        const thumbnailUrl = video.snippet.thumbnails.medium.url
        onSelect({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
            thumbnail: thumbnailUrl,
            name: video.snippet.title
        })
        onClose()
    }

    const renderVideoItem = (video, index) => (
        <div
            key={video.id.videoId}
            ref={index === youtubeResults.length - 1 ? lastVideoElementRef : null}
            className="flex flex-col rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 overflow-hidden shadow-md"
            onClick={() => handleYoutubeSelect(video)}
        >
            <div className="relative w-full pt-[56.25%]">
                <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            <div className="p-2">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{video.snippet.title}</h3>
                <p className="text-xs text-gray-600">{video.snippet.channelTitle}</p>
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[80vh] flex flex-col bg-white">
                <DialogHeader className="border-b pb-4 flex items-center justify-between">
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                        <svg viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet" focusable="false"
                             className="w-24 h-6 text-red-600 mr-2">
                            <g viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet">
                                <g>
                                    <path
                                        d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
                                        fill="#FF0000"></path>
                                    <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
                                          fill="white"></path>
                                </g>
                                <g>
                                    <g>
                                        <path
                                            d="M34.6024 13.0036L31.3945 1.41846H34.1932L35.3174 6.6701C35.6043 7.96361 35.8136 9.06662 35.95 9.97913H36.0323C36.1264 9.32532 36.3381 8.22937 36.665 6.68892L37.8291 1.41846H40.6278L37.3799 13.0036V18.561H34.6001V13.0036H34.6024Z"></path>
                                        <path
                                            d="M41.4697 18.1937C40.9053 17.8127 40.5031 17.22 40.2632 16.4157C40.0257 15.6114 39.9058 14.5437 39.9058 13.2078V11.3898C39.9058 10.0422 40.0422 8.95805 40.315 8.14196C40.5878 7.32588 41.0135 6.72851 41.592 6.35457C42.1706 5.98063 42.9302 5.79248 43.871 5.79248C44.7976 5.79248 45.5384 5.98298 46.0981 6.36398C46.6555 6.74497 47.0647 7.34234 47.3234 8.15137C47.5821 8.96275 47.7115 10.0422 47.7115 11.3898V13.2078C47.7115 14.5437 47.5845 15.6161 47.3329 16.4251C47.0812 17.2365 46.672 17.8292 46.1075 18.2031C45.5431 18.5771 44.7764 18.7652 43.8098 18.7652C42.8126 18.7675 42.0342 18.5747 41.4697 18.1937ZM44.6353 16.2323C44.7905 15.8231 44.8705 15.1575 44.8705 14.2309V10.3292C44.8705 9.43077 44.7929 8.77225 44.6353 8.35833C44.4777 7.94206 44.2026 7.7351 43.8074 7.7351C43.4265 7.7351 43.156 7.94206 43.0008 8.35833C42.8432 8.77461 42.7656 9.43077 42.7656 10.3292V14.2309C42.7656 15.1575 42.8408 15.8254 42.9914 16.2323C43.1419 16.6415 43.4123 16.8461 43.8074 16.8461C44.2026 16.8461 44.4777 16.6415 44.6353 16.2323Z"></path>
                                        <path
                                            d="M56.8154 18.5634H54.6094L54.3648 17.03H54.3037C53.7039 18.1871 52.8055 18.7656 51.6061 18.7656C50.7759 18.7656 50.1621 18.4928 49.767 17.9496C49.3719 17.4039 49.1743 16.5526 49.1743 15.3955V6.03751H51.9942V15.2308C51.9942 15.7906 52.0553 16.188 52.1776 16.4256C52.2999 16.6631 52.5045 16.783 52.7914 16.783C53.036 16.783 53.2712 16.7078 53.497 16.5573C53.7228 16.4067 53.8874 16.2162 53.9979 15.9858V6.03516H56.8154V18.5634Z"></path>
                                        <path
                                            d="M64.4755 3.68758H61.6768V18.5629H58.9181V3.68758H56.1194V1.42041H64.4755V3.68758Z"></path>
                                        <path
                                            d="M71.2768 18.5634H69.0708L68.8262 17.03H68.7651C68.1654 18.1871 67.267 18.7656 66.0675 18.7656C65.2373 18.7656 64.6235 18.4928 64.2284 17.9496C63.8333 17.4039 63.6357 16.5526 63.6357 15.3955V6.03751H66.4556V15.2308C66.4556 15.7906 66.5167 16.188 66.639 16.4256C66.7613 16.6631 66.9659 16.783 67.2529 16.783C67.4974 16.783 67.7326 16.7078 67.9584 16.5573C68.1842 16.4067 68.3488 16.2162 68.4593 15.9858V6.03516H71.2768V18.5634Z"></path>
                                        <path
                                            d="M80.609 8.0387C80.4373 7.24849 80.1621 6.67699 79.7812 6.32186C79.4002 5.96674 78.8757 5.79035 78.2078 5.79035C77.6904 5.79035 77.2059 5.93616 76.7567 6.23014C76.3075 6.52412 75.9594 6.90747 75.7148 7.38489H75.6937V0.785645H72.9773V18.5608H75.3056L75.5925 17.3755H75.6537C75.8724 17.7988 76.1993 18.1304 76.6344 18.3774C77.0695 18.622 77.554 18.7443 78.0855 18.7443C79.038 18.7443 79.7412 18.3045 80.1904 17.4272C80.6396 16.5476 80.8653 15.1765 80.8653 13.3092V11.3266C80.8653 9.92722 80.7783 8.82892 80.609 8.0387ZM78.0243 13.1492C78.0243 14.0617  77.9867 14.7767 77.9114 15.2941C77.8362 15.8115 77.7115 16.1808 77.5328 16.3971C77.3564 16.6158 77.1165 16.724 76.8178 16.724C76.585 16.724 76.371 16.6699 76.1734 16.5594C75.9759 16.4512 75.816 16.2866 75.6937 16.0702V8.96062C75.7877 8.6196 75.9524 8.34209 76.1852 8.12337C76.4157 7.90465 76.6697 7.79646 76.9401 7.79646C77.2271 7.79646 77.4481 7.90935 77.6034 8.13278C77.7609 8.35855 77.8691 8.73485 77.9303 9.26636C77.9914 9.79787 78.022 10.5528 78.022 11.5335V13.1492H78.0243Z"></path>
                                        <path
                                            d="M84.8657 13.8712C84.8657 14.6755 84.8892 15.2776 84.9363 15.6798C84.9833 16.0819 85.0821 16.3736 85.2326 16.5594C85.3831 16.7428 85.6136 16.8345 85.9264 16.8345C86.3474 16.8345 86.639 16.6699 86.7942 16.343C86.9518 16.0161 87.0365 15.4705 87.0506 14.7085L89.4824 14.8519C89.4965 14.9601 89.5035 15.1106 89.5035 15.3011C89.5035 16.4582 89.186 17.3237 88.5534 17.8952C87.9208 18.4667 87.0247 18.7536 85.8676 18.7536C84.4777 18.7536 83.504 18.3185 82.9466 17.446C82.3869 16.5735 82.1094 15.2259 82.1094 13.4008V11.2136C82.1094 9.33452 82.3987 7.96105 82.9772 7.09558C83.5558 6.2301 84.5459 5.79736 85.9499 5.79736C86.9165 5.79736 87.6597 5.97375 88.1771 6.32888C88.6945 6.684 89.059 7.23433 89.2707 7.98457C89.4824 8.7348 89.5882 9.76961 89.5882 11.0913V13.2362H84.8657V13.8712ZM85.2232 7.96811C85.0797 8.14449 84.9857 8.43377 84.9363 8.83593C84.8892 9.2381 84.8657 9.84722 84.8657 10.6657V11.5641H86.9283V10.6657C86.9283 9.86133 86.9001 9.25221 86.846 8.83593C86.7919 8.41966 86.6931 8.12803 86.5496 7.95635C86.4062 7.78702 86.1851 7.7 85.8864 7.7C85.5854 7.70235 85.3643 7.79172 85.2232 7.96811Z"></path>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2 my-4">
                    <div className="relative flex-grow">
                        <Input
                            value={youtubeSearch}
                            onChange={(e) => setYoutubeSearch(e.target.value)}
                            placeholder="Buscar en YouTube"
                            className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleYoutubeSearch(youtubeSearch)}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    </div>
                    <Button
                        onClick={() => handleYoutubeSearch(youtubeSearch)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Buscar
                    </Button>
                </div>
                {isLoading && youtubeResults.length === 0 ? (
                    <div className="flex flex-col justify-center items-center flex-grow">
                        <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4"/>
                        <p className="text-gray-600">Buscando videos...</p>
                    </div>
                ) : noResults ? (
                    <div className="flex flex-col justify-center items-center flex-grow">
                        <svg className="w-16 h-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                                stroke="currentColor" strokeWidth="2"/>
                            <path d="M10 9L15 12L10 15V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        <p className="text-gray-600">No se encontraron videos. Intenta con otra búsqueda.</p>
                    </div>
                ) : (
                    <ScrollArea className="flex-grow pr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {youtubeResults.map((video, index) => renderVideoItem(video, index))}
                        </div>
                        {isLoading && youtubeResults.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Loader2 className="w-6 h-6 animate-spin text-red-600"/>
                            </div>
                        )}
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}