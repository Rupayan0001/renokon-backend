import MathModel from "../model/game_model/mathQuestion.model.js";

export const getquestion = async (topic) => {
  try {
    // const categories = [
    //   { name: "Easy", limit: 5 },
    //   { name: "Medium", limit: 10 },
    //   { name: "Hard", limit: 5 },
    //   { name: "Puzzle", limit: 10 },
    // ];
    const arr = ["Maths", "Cricket", "Football", "Bollywood", "Music", "Business", "Finance", "Personality", "Geography", "History"];
    const randomTopic = arr[Math.floor(Math.random() * arr.length)];
    const questions = await MathModel.aggregate([
      { $match: { topic: randomTopic } },
      { $sample: { size: 20 } },
      {
        $project: {
          _id: 1,
          question: 1,
          options: 1,
          category: 1,
          correct_answer: 1,
        },
      },
    ]);

    return questions;
    // if (topic === "Maths") {
    //   // const questions = await Promise.all(
    //   //   categories.map(({ name, limit }) =>
    //   //     MathModel.aggregate([
    //   //       { $match: { category: name } },
    //   //       { $sample: { size: limit } },
    //   //       {
    //   //         $project: {
    //   //           _id: 1,
    //   //           question: 1,
    //   //           options: 1,
    //   //           category: 1,
    //   //           correct_answer: 1,
    //   //         },
    //   //       },
    //   //     ])
    //   //   )
    //   // );
    //   // return questions.flat(1);
    // } else {

    // }
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};
