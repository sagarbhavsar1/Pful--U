"use client";
import { useState } from "react";

/* Real Unsplash images mapped per event name */
const eventImages = {
    "End of Finals Blowout": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop",
    "Friday Night Pregame": "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=600&h=400&fit=crop",
    "Rooftop Kickback": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    "Welcome Week Mixer": "https://images.unsplash.com/photo-1529543544282-ea99407407c1?w=600&h=400&fit=crop",
    "Last Day of Classes Party": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
    "Apartment Warming": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
    "Spring Fling Bash": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop",
    "Post-Midterm Celebration": "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&h=400&fit=crop",
    "Sunset Vibes Only": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    "Themed Costume Party": "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600&h=400&fit=crop",
    "Day Drink & Chill": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop",
    "Block Party Madness": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    "CS Club Demo Night": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
    "Debate Society Social": "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop",
    "Engineering Showcase": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    "Finance Club Networking": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    "Photography Club Gallery Walk": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
    "Film Club Screening Night": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    "Startup Pitch Night": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop",
    "Sarah's 21st!": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=400&fit=crop",
    "Jake's Birthday Bash": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
    "Surprise Birthday Party": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    "Mia's Golden Birthday": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=400&fit=crop",
    "Rooftop Birthday Dinner": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    "Tech Industry Mixer": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    "Alumni Career Panel": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    "Startup Founders Night": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
    "Resume Workshop & Social": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    "Mentor Matching Social": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
    "Calc III Study Session": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    "Organic Chem Review": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop",
    "Physics Notes Swap": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop",
    "CS 101 Office Hours": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
    "Library Grind Squad": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "March Madness Watch Party": "https://images.unsplash.com/photo-1461896836934-bd45ba40b09e?w=600&h=400&fit=crop",
    "Super Bowl Screening": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
    "Game Day Tailgate": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&fit=crop",
    "Championship Finals Watch": "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=400&fit=crop",
    "Diwali Celebration": "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&h=400&fit=crop",
    "Lunar New Year Fest": "https://images.unsplash.com/photo-1548266652-99cf27701ab1?w=600&h=400&fit=crop",
    "Latin Night Dance": "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=400&fit=crop",
    "International Food Festival": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    "K-Pop Dance Cover Night": "https://images.unsplash.com/photo-1547153760-18fc86c1fc8e?w=600&h=400&fit=crop",
    "Karaoke Night": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop",
    "Open Mic Comedy": "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop",
    "Movie Night on the Quad": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    "Thrift Swap Meet": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    "Board Game Tournament": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&h=400&fit=crop",
};

/* Fallback images by type */
const fallbackImages = {
    "House party": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop",
    "Club event": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    "Birthday": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=400&fit=crop",
    "Networking": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop",
    "Study group": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    "Sports watch": "https://images.unsplash.com/photo-1461896836934-bd45ba40b09e?w=600&h=400&fit=crop",
    "Cultural": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    "Other": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
};

/* Custom descriptions per event name */
const eventDescriptions = {
    "End of Finals Blowout": "You survived finals. Now it's time to celebrate. Pull up with your crew for the biggest end-of-semester rager on campus. DJ, drinks, good energy only.",
    "Friday Night Pregame": "The weekend starts here. Meet up before heading out, get hype, and make plans. BYOB and bring your best energy.",
    "Rooftop Kickback": "Chill vibes on the rooftop with city views, lo-fi beats, and your closest friends. Dress cute, the sunset photos will be elite.",
    "Welcome Week Mixer": "New semester, new friends. Mix and mingle with upperclassmen, transfer students, and everyone in between. Free food, good conversations.",
    "Last Day of Classes Party": "We made it. One last hurrah before summer. Pull up to celebrate the end of another semester with the whole squad.",
    "Apartment Warming": "New place, who dis? Come check out the new spot. Housewarming gifts optional but appreciated. Snacks and vibes provided.",
    "Spring Fling Bash": "Spring has sprung and so has the party. Outdoor vibes, fresh playlists, and the whole campus coming together for one epic night.",
    "Post-Midterm Celebration": "Midterms are over and we're done pretending to have it together. Time to let loose. No studying allowed at this party.",
    "Sunset Vibes Only": "Golden hour, good music, great company. A laid-back evening to decompress and enjoy the sunset with friends. Bring a blanket.",
    "Themed Costume Party": "This month's theme: Y2K. Low-rise jeans, butterfly clips, and frosted tips encouraged. Best costume wins a prize. Go all out.",
    "Day Drink & Chill": "Saturday afternoon, backyard, cooler full of drinks. The kind of lowkey hangout that always turns into the best day ever.",
    "Block Party Madness": "The whole block is shutting down for this one. Multiple DJs, food trucks, and activities. Bring the whole friend group.",
    "CS Club Demo Night": "See what your classmates have been building all semester. Live demos, project showcases, and free pizza. Open to all majors.",
    "Debate Society Social": "Come for the debates, stay for the after-party. Whether you're a member or just love a good argument, you're welcome here.",
    "Engineering Showcase": "Final projects on display from all engineering departments. Robots, apps, bridges, you name it. Networking opportunities included.",
    "Finance Club Networking": "Connect with alumni working at top banks and consulting firms. Business casual. Bring your resume and your A-game.",
    "Photography Club Gallery Walk": "Student photography on display in a gallery-style exhibition. Wine and cheese provided. Support your fellow artists.",
    "Film Club Screening Night": "Original student short films followed by a Q&A with the filmmakers. Popcorn's on us. Come appreciate indie cinema.",
    "Startup Pitch Night": "Five student startups, five minutes each, one winner. Come watch your classmates pitch their ideas to real investors.",
    "Sarah's 21st!": "It's finally the big 2-1! Help Sarah celebrate in style. themed drinks, a photo booth, and cake. Don't be late!",
    "Jake's Birthday Bash": "Jake's turning up for his birthday and you're invited. Expect good music, great people, and way too many birthday shots.",
    "Surprise Birthday Party": "Shhh... it's a surprise! Show up at 7 sharp and hide. We're throwing the birthday of the year. Don't spill the beans.",
    "Mia's Golden Birthday": "Mia turns 22 on the 22nd! Dress code: gold and glitter. This is going to be the most aesthetic birthday ever.",
    "Rooftop Birthday Dinner": "An intimate rooftop dinner to celebrate. Good food, fairy lights, and your closest friends. RSVP required, spots are limited.",
    "Tech Industry Mixer": "Rub elbows with recruiters from top tech companies. Casual networking over drinks and appetizers. All class years welcome.",
    "Alumni Career Panel": "Hear from recent grads about landing their first jobs. Real talk, real advice, real connections. Q&A session included.",
    "Startup Founders Night": "Meet the student entrepreneurs building the next big thing. Pitch ideas, find co-founders, and get inspired by campus innovation.",
    "Resume Workshop & Social": "Get your resume reviewed by career counselors, then stick around for snacks and networking. Bring a printed copy.",
    "Mentor Matching Social": "Get paired with an upperclassman or alumni mentor in your field. Speed-networking format with snacks. Sign up in advance.",
    "Calc III Study Session": "Multivariable calculus is no joke. Let's work through problem sets together. Bring your textbook and questions. We've got whiteboards.",
    "Organic Chem Review": "O-Chem exam coming up? Same. Let's review mechanisms, reactions, and naming conventions together. Misery loves company.",
    "Physics Notes Swap": "Share your best notes, fill in your gaps, and prep for the final together. All physics levels welcome.",
    "CS 101 Office Hours": "Stuck on your programming assignment? Come get help from TAs and fellow students. Laptops required, snacks provided.",
    "Library Grind Squad": "Reserved a study room in the library. We're locking in from 2 PM until it's done. Accountability partners wanted.",
    "March Madness Watch Party": "Big screen, bracket predictions, and way too much yelling. Come watch the games with the biggest sports fans on campus.",
    "Super Bowl Screening": "The biggest game of the year deserves the biggest watch party. Wings, nachos, and halftime show reactions. Let's go!",
    "Game Day Tailgate": "Pre-game tailgate before the big rivalry match. Grills, cornhole, and school spirit. Wear your team colors!",
    "Championship Finals Watch": "The finals are here and we're watching together. Bring your lucky jersey and your hot takes. May the best team win.",
    "Diwali Celebration": "Festival of Lights on campus! Traditional food, henna, rangoli making, and a spectacular lamp-lighting ceremony. All are welcome.",
    "Lunar New Year Fest": "Ring in the Lunar New Year with traditional performances, dumplings, and red envelope giveaways. Gong xi fa cai!",
    "Latin Night Dance": "Salsa, bachata, and reggaeton all night. Beginners welcome, experienced dancers encouraged. Free dance lesson at 8 PM.",
    "International Food Festival": "Taste dishes from 20+ countries prepared by international students. $5 wristband gets you unlimited samples. Come hungry!",
    "K-Pop Dance Cover Night": "Learn K-Pop choreography and perform with the dance team. BTS, BLACKPINK, Stray Kids, and more. No experience needed!",
    "Karaoke Night": "Grab the mic and belt your heart out. From Beyonce to Bohemian Rhapsody, all songs welcome. No judgment zone.",
    "Open Mic Comedy": "Think you're funny? Prove it. 5-minute sets, supportive crowd, and the funniest night of the week. Sign up at the door.",
    "Movie Night on the Quad": "Outdoor screening under the stars. This week: The Grand Budapest Hotel. Bring blankets and snacks. Rain date TBA.",
    "Thrift Swap Meet": "Bring clothes you don't wear anymore and swap them for new-to-you pieces. Sustainable fashion at its finest. Free entry.",
    "Board Game Tournament": "Settlers of Catan, Codenames, and more. Teams of 2-4, winner takes the trophy. Snacks and drinks provided. Get competitive!",
};

/* Vibe tags by event type */
const vibeMap = {
    "House party": { label: "rager", emoji: "\ud83e\udd2a", color: "#f43f5e" },
    "Club event": { label: "hype", emoji: "\ud83d\udd25", color: "#f97316" },
    "Birthday": { label: "bougie", emoji: "\u2728", color: "#a855f7" },
    "Networking": { label: "professional", emoji: "\ud83d\udcbc", color: "#3b82f6" },
    "Study group": { label: "chill", emoji: "\ud83d\ude0c", color: "#14b8a6" },
    "Sports watch": { label: "hype", emoji: "\ud83d\udd25", color: "#f97316" },
    "Cultural": { label: "aesthetic", emoji: "\ud83e\udd8b", color: "#8b5cf6" },
    "Other": { label: "lowkey", emoji: "\ud83c\udf3f", color: "#10b981" },
};

/* Hashtags per event name */
const hashtagMap = {
    "End of Finals Blowout": ["#finals", "#rager", "#party"],
    "Friday Night Pregame": ["#pregame", "#friday", "#vibes"],
    "Rooftop Kickback": ["#rooftop", "#chill", "#sunset"],
    "Welcome Week Mixer": ["#welcome", "#mixer", "#friends"],
    "Last Day of Classes Party": ["#lastday", "#celebrate", "#summer"],
    "Apartment Warming": ["#housewarming", "#newplace", "#hangout"],
    "Spring Fling Bash": ["#spring", "#fling", "#outdoor"],
    "Post-Midterm Celebration": ["#midterms", "#done", "#party"],
    "Sunset Vibes Only": ["#sunset", "#chill", "#golden"],
    "Themed Costume Party": ["#y2k", "#costume", "#throwback"],
    "Day Drink & Chill": ["#daydrink", "#saturday", "#backyard"],
    "Block Party Madness": ["#block", "#party", "#dj"],
    "CS Club Demo Night": ["#cs", "#tech", "#demos"],
    "Debate Society Social": ["#debate", "#social", "#discuss"],
    "Engineering Showcase": ["#engineering", "#projects", "#stem"],
    "Finance Club Networking": ["#finance", "#networking", "#career"],
    "Photography Club Gallery Walk": ["#photography", "#gallery", "#art"],
    "Film Club Screening Night": ["#film", "#indie", "#screening"],
    "Startup Pitch Night": ["#startup", "#pitch", "#founders"],
    "Sarah's 21st!": ["#21st", "#birthday", "#cheers"],
    "Jake's Birthday Bash": ["#birthday", "#bash", "#party"],
    "Surprise Birthday Party": ["#surprise", "#birthday", "#shh"],
    "Mia's Golden Birthday": ["#golden", "#glitter", "#aesthetic"],
    "Rooftop Birthday Dinner": ["#rooftop", "#dinner", "#intimate"],
    "Tech Industry Mixer": ["#tech", "#recruiting", "#networking"],
    "Alumni Career Panel": ["#alumni", "#career", "#advice"],
    "Startup Founders Night": ["#founders", "#startup", "#innovation"],
    "Resume Workshop & Social": ["#resume", "#career", "#workshop"],
    "Mentor Matching Social": ["#mentor", "#networking", "#growth"],
    "Calc III Study Session": ["#calculus", "#study", "#math"],
    "Organic Chem Review": ["#ochem", "#study", "#science"],
    "Physics Notes Swap": ["#physics", "#notes", "#exam"],
    "CS 101 Office Hours": ["#coding", "#help", "#cs101"],
    "Library Grind Squad": ["#library", "#grind", "#focus"],
    "March Madness Watch Party": ["#marchmadness", "#basketball", "#brackets"],
    "Super Bowl Screening": ["#superbowl", "#football", "#wings"],
    "Game Day Tailgate": ["#tailgate", "#gameday", "#rivalry"],
    "Championship Finals Watch": ["#finals", "#championship", "#sports"],
    "Diwali Celebration": ["#diwali", "#lights", "#festival"],
    "Lunar New Year Fest": ["#lunarnewyear", "#culture", "#food"],
    "Latin Night Dance": ["#salsa", "#bachata", "#dance"],
    "International Food Festival": ["#food", "#culture", "#global"],
    "K-Pop Dance Cover Night": ["#kpop", "#dance", "#bts"],
    "Karaoke Night": ["#karaoke", "#singing", "#fun"],
    "Open Mic Comedy": ["#comedy", "#openmic", "#laughs"],
    "Movie Night on the Quad": ["#movie", "#outdoor", "#cinema"],
    "Thrift Swap Meet": ["#thrift", "#swap", "#sustainable"],
    "Board Game Tournament": ["#boardgames", "#tournament", "#catan"],
};

/* Vibrant gradient backgrounds for cards */
const gradients = [
    "linear-gradient(135deg, #a855f7, #7c3aed)",
    "linear-gradient(135deg, #ec4899, #f472b6)",
    "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    "linear-gradient(135deg, #14b8a6, #06b6d4)",
    "linear-gradient(135deg, #f97316, #fb923c)",
    "linear-gradient(135deg, #f43f5e, #fb7185)",
    "linear-gradient(135deg, #8b5cf6, #ec4899)",
    "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "linear-gradient(135deg, #f59e0b, #f97316)",
    "linear-gradient(135deg, #10b981, #14b8a6)",
    "linear-gradient(135deg, #e879f9, #a855f7)",
    "linear-gradient(135deg, #fb923c, #f43f5e)",
];

function getImage(name, type) {
    return eventImages[name] || fallbackImages[type] || fallbackImages["Other"];
}

function getDescription(name, type) {
    return eventDescriptions[name] || `Something amazing is happening and you don't want to miss it. Grab your crew and come through.`;
}

function getHashtags(name, type) {
    if (hashtagMap[name]) return hashtagMap[name];
    const typeHashtags = {
        "House party": ["#party", "#vibes", "#pregame"],
        "Club event": ["#club", "#campus", "#events"],
        "Birthday": ["#birthday", "#celebrate", "#friends"],
        "Networking": ["#network", "#career", "#connect"],
        "Study group": ["#study", "#grind", "#focus"],
        "Sports watch": ["#gameday", "#sports", "#watch"],
        "Cultural": ["#culture", "#diversity", "#fest"],
        "Other": ["#fun", "#hangout", "#campus"],
    };
    return typeHashtags[type] || typeHashtags["Other"];
}

export default function EventCard({ event, index = 0 }) {
    const [showDetail, setShowDetail] = useState(false);
    const gradient = gradients[index % gradients.length];
    const vibe = vibeMap[event.type] || vibeMap["Other"];
    const hashtags = getHashtags(event.name, event.type);
    const description = getDescription(event.name, event.type);
    const imgSrc = getImage(event.name, event.type);

    // Parse date for badge
    const dateParts = event.date.split(", ");
    const dateStr = dateParts[1] || "Mar 7";
    const dayNum = dateStr.split(" ")[1] || "07";
    const monthStr = dateStr.split(" ")[0] || "Mar";
    const isLive = index < 4;

    return (
        <>
            <div
                className="pf-event-card"
                onClick={() => setShowDetail(true)}
                style={{ cursor: "pointer" }}
            >
                {/* Image header with overlay gradient */}
                <div className="pf-card-image-wrap">
                    <img src={imgSrc} alt={event.name} className="pf-card-image" loading="lazy" />
                    <div className="pf-card-image-overlay" style={{ background: `${gradient}, transparent` }}></div>
                    <div className="pf-card-date-badge">
                        <span className="pf-card-date-day">{dayNum}</span>
                        <span className="pf-card-date-month">{monthStr.toUpperCase()}</span>
                    </div>
                    {isLive && <div className="pf-card-live-badge">LIVE</div>}
                </div>

                {/* Card body */}
                <div className="pf-card-body">
                    <div className="pf-card-title-row">
                        <span className="pf-card-title">{event.name}</span>
                        <span className="pf-card-vibe" style={{ background: `${vibe.color}15`, color: vibe.color }}>
                            {vibe.emoji} {vibe.label}
                        </span>
                    </div>
                    <div className="pf-card-details">
                        <span>📅 {event.time}</span>
                        <span>📍 {(event.location || "TBA").substring(0, 18)}...</span>
                        <span>👥 {event.rsvps}</span>
                    </div>
                    <div className="pf-card-hashtags">
                        {hashtags.map(tag => (
                            <span key={tag} className="pf-card-hashtag">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Event Detail Modal */}
            {showDetail && (
                <div className="pf-modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Image header */}
                        <div className="pf-modal-header">
                            <img src={imgSrc} alt={event.name} className="pf-modal-header-img" />
                            <div className="pf-modal-header-overlay" style={{ background: `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6))` }}></div>
                            <button className="pf-modal-back" onClick={() => setShowDetail(false)}>
                                ← Back
                            </button>
                            {isLive && <div className="pf-modal-live">LIVE</div>}
                            <button className="pf-modal-share">↗ Share</button>
                        </div>

                        {/* Content */}
                        <div className="pf-modal-content">
                            <div className="pf-modal-title-row">
                                <h2 className="pf-modal-title">{event.name}</h2>
                                <span className="pf-card-vibe" style={{ background: `${vibe.color}15`, color: vibe.color }}>
                                    {vibe.emoji} {vibe.label}
                                </span>
                            </div>

                            <div className="pf-modal-tags">
                                {hashtags.map(tag => (
                                    <span key={tag} className="pf-modal-tag">{tag}</span>
                                ))}
                            </div>

                            <div className="pf-modal-info-grid">
                                <div className="pf-modal-info-item">
                                    <span className="pf-modal-info-icon">📅</span>
                                    <div>
                                        <div className="pf-modal-info-main">{event.date}</div>
                                        <div className="pf-modal-info-sub">{event.time}</div>
                                    </div>
                                </div>
                                <div className="pf-modal-info-item">
                                    <span className="pf-modal-info-icon">📍</span>
                                    <div>
                                        <div className="pf-modal-info-main">{event.location || "TBA"}</div>
                                        <div className="pf-modal-info-sub">Location</div>
                                    </div>
                                </div>
                                <div className="pf-modal-info-item">
                                    <span className="pf-modal-info-icon">👥</span>
                                    <div>
                                        <div className="pf-modal-info-main">{event.rsvps}</div>
                                        <div className="pf-modal-info-sub">Max guests</div>
                                    </div>
                                </div>
                                <div className="pf-modal-info-item">
                                    <span className="pf-modal-info-icon">👔</span>
                                    <div>
                                        <div className="pf-modal-info-main">{vibe.label}</div>
                                        <div className="pf-modal-info-sub">Dress code</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pf-modal-about">
                                <h3>About This Event</h3>
                                <p>{description}</p>
                            </div>

                            <div className="pf-modal-rsvp-stats">
                                <div className="pf-rsvp-stat going">
                                    <span className="pf-rsvp-num">{Math.floor(event.rsvps * 0.6)}</span>
                                    <span className="pf-rsvp-label">GOING 🎉</span>
                                </div>
                                <div className="pf-rsvp-stat maybe">
                                    <span className="pf-rsvp-num">{Math.floor(event.rsvps * 0.25)}</span>
                                    <span className="pf-rsvp-label">MAYBE 🤔</span>
                                </div>
                                <div className="pf-rsvp-stat total">
                                    <span className="pf-rsvp-num">{event.rsvps}</span>
                                    <span className="pf-rsvp-label">TOTAL 📊</span>
                                </div>
                            </div>

                            <button className="pf-modal-rsvp-btn">
                                🎉 RSVP Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
