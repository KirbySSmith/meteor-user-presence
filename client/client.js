var timer, status;

UserPresence = {
	awayTime: 60000, //1 minute
	awayOnWindowBlur: false,
	onSetUserStatus: function() {},

	startTimer: function() {
		UserPresence.stopTimer();
		timer = setTimeout(UserPresence.setAway, UserPresence.awayTime);
	},
	stopTimer: function() {
		clearTimeout(timer);
	},
	restartTimer: function() {
		UserPresence.startTimer();
	},
	setAway: function() {
		if (status !== 'away') {
			status = 'away';
			Meteor.call('UserPresence:away');
		}
		UserPresence.stopTimer();
	},
	setOnline: function() {
		if (status !== 'online') {
			status = 'online';
			Meteor.call('UserPresence:online');
		}
		UserPresence.startTimer();
	},
	start: function() {
		Deps.autorun(function() {
			var user = Meteor.user();
			status = user && user.statusConnection;
			UserPresence.startTimer();
		});

		Meteor.methods({
			'UserPresence:setDefaultStatus': function(status) {
				Meteor.users.update({_id: Meteor.userId()}, {$set: {status: status, statusDefault: status}});
			},
			'UserPresence:online': function() {
				var user = Meteor.user();
				if (user && user.statusDefault === 'online') {
					Meteor.users.update({_id: Meteor.userId()}, {$set: {status: 'online'}});
				}
				UserPresence.onSetUserStatus(user, 'online');
			},
			'UserPresence:away': function() {
				var user = Meteor.user();
				UserPresence.onSetUserStatus(user, 'away');
			}
		});

		document.addEventListener('mousemove', UserPresence.setOnline);
		document.addEventListener('mousedown', UserPresence.setOnline);
		document.addEventListener('touchend', UserPresence.setOnline);
		document.addEventListener('keydown', UserPresence.setOnline);
		window.addEventListener('focus', UserPresence.setOnline);

		if (UserPresence.awayOnWindowBlur === true) {
			window.addEventListener('blur', UserPresence.setAway);
		}
	}
}
