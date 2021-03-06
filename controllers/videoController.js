import routes from "../routes";
import Video from "../models/video";
import Comments from "../models/comment";

export const home = async (req, res) => {
	try {
		const videos = await Video.find({}).sort({ _id: -1 });
		console.log(videos);
		res.render("Home", { pageTitle: "home", videos });
	} catch (error) {
		console.log(error);
		res.render("Home", { pageTitle: "home", videos: [] });
	}
};

export const getUpload = (req, res) => {
	res.render("Upload", { pageTitle: "Upload" });
};

export const postUpload = async (req, res) => {
	const {
		body: { title, description },
		file: { path },
	} = req;
	const newVideo = await Video.create({
		fileUrl: path,
		title,
		description,
	});
	res.redirect(routes.videoDetail(newVideo.id));
};
// TO DO: upload and save video
export const search = async (req, res) => {
	const {
		query: { term: searchingBy },
	} = req;
	let videos = [];
	try {
		videos = await Video.find({
			title: { $regex: searchingBy, $options: "i" },
		});
	} catch (error) {
		console.log(error);
	}
	res.render("search", { pageTitle: "search", searchingBy, videos });
};

export const videoDetail = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id).populate("comments");
		res.render("videoDetail", { pageTitle: video.title, video });
	} catch (error) {
		console.log(error);
	}
};

export const getEditVideo = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id);
		res.render("editVideo", { pageTitle: `Edit ${Video.title}`, video });
	} catch (error) {
		res.redirect(routes.home);
	}
};

export const postEditVideo = async (req, res) => {
	const {
		params: { id },
		body: { title, description },
	} = req;
	try {
		await Video.findOneAndUpdate({ _id: id }, { title, description });
		res.redirect(routes.videoDetail(id));
	} catch (error) {
		res.redirect(routes.home);
	}
};

export const deleteVideo = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		await Video.findOneAndDelete({ _id: id });
	} catch (error) {
		console.log(error);
	}
	res.redirect(routes.home);
};

//Register video view

export const postregisterView = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id);
		video.views += 1;
		video.save();
		res.status(200);
	} catch (error) {
		res.status(400);
	} finally {
		res.end();
	}
};

//ADD comment
export const postAddComment = async (req, res) => {
	const {
		params: { id },
		body: { comment },
		user,
	} = req;
	try {
		const video = await Video.findById(id);
		const newComment = await Comment.create({
			text: comment,
			creator: user.id,
		});
		video.comments.push(newComment.id);
		video.save();
	} catch (error) {
		res.status(400);
	} finally {
		res.end();
	}
};
