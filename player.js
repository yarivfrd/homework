const VP = {};

VP.video = document.querySelector("video");
VP.playPauseBtn = document.querySelector("#playPause");
VP.currentTime = document.querySelector(".currentTime");

VP.socialContainer = document.querySelector(".social");
VP.views = document.querySelector(".views");
VP.thumbsUp = document.querySelector("#thumbsUp");
VP.thumbsDown = document.querySelector("#thumbsDown");

VP.handleDomLoaded = function() {
	VP.video.autoplay
		? VP.playPauseBtn.classList.add("pause")
		: VP.playPauseBtn.classList.add("play");

	const config = {
		apiKey: "AIzaSyDLTqwBISf53dOlKdCMh4irPPF3cVxR7Jo",
		authDomain: "eko-video-player.firebaseapp.com",
		databaseURL: "https://eko-video-player.firebaseio.com",
		projectId: "eko-video-player",
		storageBucket: "",
		messagingSenderId: "923028546862"
	};

	firebase.initializeApp(config);

	// Read from DB and update UI
	const DbRef = firebase.database().ref("videoStats");

	DbRef.once("value")
		.then(function(snapshot) {
			VP.socialContainer.classList.remove("hidden");
		})
		.catch(VP.handleDbError);

	DbRef.on("value", function(snapshot) {
		VP.updateUi(snapshot.val());
    });

	// Write to DB
	VP.updateDb = function(dataToUpdate) {
		firebase
			.database()
			.ref("videoStats")
			.set({
				views:
					dataToUpdate === "views"
						? ++VP.lastSnapshot.views
						: VP.lastSnapshot.views,
				likes:
					dataToUpdate === "likes"
						? ++VP.lastSnapshot.likes
						: VP.lastSnapshot.likes,
				dislikes:
					dataToUpdate === "dislikes"
						? ++VP.lastSnapshot.dislikes
						: VP.lastSnapshot.dislikes
			});
	};
};

VP.handleDbError = function() {
    VP.socialContainer.innerHTML =
    '<div class="db-error">could not retrieve video data 😕</div>';
    VP.socialContainer.classList.remove("hidden");
}

VP.updateUi = function(stats) {
	VP.lastSnapshot = stats;
	VP.views.textContent = stats.views;
	VP.thumbsUp.textContent = `👍 ${stats.likes}`;
	VP.thumbsDown.textContent = `👎 ${stats.dislikes}`;
};

VP.handlePlayPause = function() {
	if (VP.video.paused) {
		VP.video.play();
		VP.playPauseBtn.classList.add("pause");
		VP.playPauseBtn.classList.remove("play");
	} else {
		VP.video.pause();
		VP.playPauseBtn.classList.remove("pause");
		VP.playPauseBtn.classList.add("play");
	}
};


VP.updateProgress = function() {
	const time = Math.floor(this.currentTime);
	VP.currentTime.textContent = VP.formatTimeCaption(time);
};

VP.formatTimeCaption = function(time) {
	return `${Math.floor(time / 60)}:${time % 60 < 10
		? "0" + time % 60
		: time % 60 ? time % 60 : "00"}`;
};

VP.handleVidEnd = function() {
	VP.updateDb("views");
};


VP.playPauseBtn.addEventListener("click", VP.handlePlayPause);
VP.video.addEventListener("timeupdate", VP.updateProgress);
VP.video.addEventListener("ended", VP.handleVidEnd);

VP.thumbsUp.addEventListener("click", () => {
	VP.updateDb("likes");
});

VP.thumbsDown.addEventListener("click", () => {
	VP.updateDb("dislikes");
});

window.addEventListener("DOMContentLoaded", VP.handleDomLoaded);
