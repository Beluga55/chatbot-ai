import { Title } from "../db.js";

export const getTitles = async (req, res) => {
  try {
    const { username } = req.body;

    // RETRIEVE ALL THE TITLES BASED ON THE USERNAME
    const titles = await Title.find(
      { username: username },
      { projection: { title: 1, _id: 1 } }
    ).toArray();

    // EXTRACT THE TITLE NAMES
    const titleNames = titles.map((title) => title.title);

    // GET THE ID OF THE TITLE
    const titleId = titles.map((title) => title._id);

    // SEND THE TITLES BACK TO THE CLIENT
    res.status(200).json({ titles: titleNames, titleId: titleId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
