import { useState, useEffect, useMemo } from 'react';

function getGreetingFromHour(hour) {
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
}

function getHourForTimezone(timeZone) {
    const hourStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        timeZone,
        hour12: false,
    }).format(new Date());

    return parseInt(hourStr, 10);
}

function getTimezoneForCountry(country) {
    const countryToTimezone = {
        US: "America/New_York",
        CA: "America/Toronto",
        IN: "Asia/Kolkata",
        GB: "Europe/London",
        JP: "Asia/Tokyo",
        AU: "Australia/Sydney",
        // Add more mappings as needed
    };

    return countryToTimezone[country];
}

export function useGreeting(user) {
    const [location, setLocation] = useState("World");
    const [hour, setHour] = useState(new Date().getHours());

    useEffect(() => {
        async function fetchLocationAndTime() {
            let detectedHour = new Date().getHours();
            let detectedLocation = "World";

            if (user?.timezone) {
                detectedHour = getHourForTimezone(user.timezone);
                detectedLocation = user.timezone.split("/").pop()?.replace(/_/g, " ") || "Unknown";
            } else if (user?.country) {
                const tz = getTimezoneForCountry(user.country);
                if (tz) {
                    detectedHour = getHourForTimezone(tz);
                    detectedLocation = tz.split("/").pop()?.replace(/_/g, " ") || user.country;
                } else {
                    try {
                        const res = await fetch("https://ipwho.is/ ");
                        const data = await res.json();
                        detectedLocation = data.city || data.region || data.country || user.country || "World";
                        detectedHour = new Date().getHours(); // Local fallback
                    } catch (err) {
                        detectedLocation = user.country || "World";
                    }
                }
            } else {
                try {
                    const res = await fetch("https://ipwho.is/ ");
                    const data = await res.json();
                    detectedLocation = data.city || data.region || data.country || "World";
                } catch (err) {
                    detectedLocation = "World";
                }
            }

            setHour(detectedHour);
            setLocation(detectedLocation);
        }

        fetchLocationAndTime();
    }, [user]);

    const greeting = useMemo(() => getGreetingFromHour(hour), [hour]);

    return { greeting, location };
}