const express = require("express");
const router = express.Router();

const {
  Contest,
  Art,
  Qey,
  Side,
  Timer,
  Summary,
  Value,
  viewArt,
} = require("../model/dataModel");
const { getUniqueQey, getUniqueTimer, getUniqueKey } = require("../Helper");
const { where } = require("sequelize");
const { type } = require("express/lib/response");

const timeThreshold = 3000;
let lastTime = 0;
let valid,
  lastkey = null,
  lastPar = null,
  lastPoint = null;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader === "Bearer mysecrettoken") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.post("/art", authMiddleware, async (req, res) => {
  const { code, val, type, power } = req.body;
  let art, end;

  try {
    if (!code) {
      throw new Error("code is required");
    }

    if (!val) {
      throw new Error("val is required");
    }

    if (!type) {
      throw new Error("type is required");
    }

    // juri
    const qey = await Qey.findOne({
      where: { key: code },
    });

    // dewan
    const contest = await Contest.findOne({
      where: { qey: code },
    });

    if (qey) {
      art = await Art.findOne({
        where: { code: code },
        where: { con: qey.contestId },
      });

      const vals = type === "press" ? val : "0.00";
      const powers = type === "power" ? val : "0.00";

      if (type === "press") {
        art.val = vals;
        art.power = powers;
        await art.save();
      } else {
        art = await Art.create({
          con: qey.contestId,
          code: code,
          val: vals,
          power: powers,
          type: type,
        });
      }

      point = await viewArt.findAll({
        attributes: ["points", "total"],
        where: { code: art.code },
        where: { con: art.con },
      });

      point = JSON.parse(JSON.stringify(point, null, 2));
      end = point[0].points;
    } else if (contest) {
      art = await Art.findOne({
        where: { code: code },
        where: { type: type },
      });
      if (art) {
        art.val = val;
        art.power = power;
        await art.save();
      } else {
        art = await Art.create({
          con: contest.id,
          code: code,
          val: val,
          power: power,
          type: type,
        });
      }

      end = art;
    } else {
      throw new Error("Invalid Code Access");
    }

    res.status(201).json({
      statusCode: "00",
      message: "Data successfully",
      data: art,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.post("/value", authMiddleware, async (req, res) => {
  const { code, point, peserta, type } = req.body;
  const currentTime = Date.now();
  const input = req.body.peserta;

  try {
    if (!code) {
      throw new Error("code is required");
    }

    if (!point) {
      throw new Error("point is required");
    }

    if (!type) {
      throw new Error("type is required");
    }

    if (!peserta) {
      throw new Error("peserta is required");
    }

    const qey = await Qey.findOne({
      where: { key: code },
    });

    if (qey) {
      await Value.create({
        key: code,
        contestId: qey.contestId,
        point: point,
        side: peserta,
      });

      if (
        code !== lastkey &&
        currentTime - lastTime <= timeThreshold &&
        peserta === lastPar &&
        point == lastPoint
      ) {
        await Summary.create({
          contestId: qey.contestId,
          side: peserta,
          val: point,
          type: type,
        });
        valid = true;
      } else {
        valid = false;
      }

      lastPoint = point;
      lastkey = code;
      lastPar = peserta;
      lastTime = currentTime;
    } else {
      throw new Error("Invalid Code Access");
    }

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: valid });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.get("/data", authMiddleware, async (req, res) => {
  try {
    const data = await Contest.findAll({
      include: [
        {
          model: Qey,
          as: "qeys",
          attributes: ['name','key'],
        },
      ]
    });
    res.status(200).json({
      statusCode: "00",
      data : data
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.post("/timer", authMiddleware, async (req, res) => {
  const { code, time, status } = req.body;
  let timer;

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    if (!time) {
      throw new Error("time is required");
    }

    if (!status) {
      throw new Error("status is required");
    }

    const contest = await Contest.findOne({
      where: { timer: code },
    });

    if (contest) {
      timer = await Timer.create({
        key: code,
        contestId: contest.id,
        status: status,
        time: time,
      });

      contest.status = status == "start" ? 1 : 0;
      await contest.save();
    } else {
      throw new Error("Invalid Code Access");
    }

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: timer });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.post("/status", authMiddleware, async (req, res) => {
  const { code, status } = req.body;

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    if (!status) {
      throw new Error("status is required");
    }

    const contest = await Contest.findOne({
      where: { qey: code },
    });

    if (contest) {
      if (status == 3) {
        contest.ver = 1;
      } else {
        contest.status = status;
      }
      await contest.save();
    } else {
      throw new Error("Invalid Code Access");
    }

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: contest });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.post("/verif", authMiddleware, async (req, res) => {
  const { code, status } = req.body;

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    if (!status) {
      throw new Error("status is required");
    }

    const contest = await Contest.findOne({
      where: { qey: code },
    });

    if (contest) {
      if (status == "close") {
        contest.ver = 0;
      } else if (status == "drop") {
        contest.ver = 1;
      } else if (status == "coach") {
        contest.ver = 2;
      } else if (status == "teguran") {
        contest.ver = 3;
      } else if (status == "warning") {
        contest.ver = 4;
      } else {
        contest.status = status;
      }
      await contest.save();
    } else {
      throw new Error("Invalid Code Access");
    }

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: contest });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.post("/drop", authMiddleware, async (req, res) => {
  const { code, val, side, type } = req.body;
  let summary;

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    if (!val) {
      throw new Error("val is required");
    }

    if (!type) {
      throw new Error("type is required");
    }

    if (!side) {
      throw new Error("side is required");
    }

    const contest = await Contest.findOne({
      where: { qey: code },
    });

    if (contest) {
      summary = await Summary.create({
        contestId: contest.id,
        side: side,
        val: val,
        type: type,
      });
    } else {
      throw new Error("Invalid Code Access");
    }

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: summary });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.post("/point", authMiddleware, async (req, res) => {
  const { code } = req.body;
  let result;

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    const qey = await Qey.findOne({
      where: { key: code },
      include: [
        {
          model: Contest,
          as: "contest",
          include: { model: Side, as: "sides" },
        },
      ],
    });

    if (qey) {
      const side = JSON.parse(JSON.stringify(qey.contest.sides, null, 2));
      const point = [
        {
          name: "Hit",
          point: "1",
          id: 1,
        },
        {
          name: "Kick",
          point: "2",
          id: 2,
        },
        {
          name: "Slam",
          point: "3",
          id: 3,
        },
      ];

      const mapped = side.map((item) => {
        return {
          name: item.name,
          type: item.type,
        };
      });

      result = { point: point, peserta: mapped };
    } else {
      throw new Error("Invalid Code Access");
    }

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: result });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.post("/auth", authMiddleware, async (req, res) => {
  const { code } = req.body;
  let peserta = [];

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    const contest = await Contest.findOne({
      where: { qey: code },
      include: [{ model: Side, as: "sides" }],
    });

    peserta = JSON.parse(JSON.stringify(contest.sides, null, 2));

    const juri = await Qey.findOne({
      where: { key: code },
      include: [{ model: Contest, as: "contest" }],
    });

    if (!contest) {
      throw new Error("Invalid Code Access");
    }

    da = {
      id: contest ? contest.id : juri.contest.id,
      key: contest ? contest.qey : juri.key,
      contest: contest ? contest.name : juri.contest.name,
      status: contest ? contest.status : juri.contest.status,
      point: contest ? contest.point : juri.contest.point,
      jurus: contest ? contest.jurus : juri.contest.jurus,
      move: contest ? contest.move : juri.contest.move,
      ver: contest ? contest.ver : juri.contest.ver,
      type: contest ? contest.type : juri.contest.type,
      name: contest ? "Dewan" : juri.name,
      peserta: peserta.map((item) => item.name),
      side: peserta.map((item) => item.type),
    };

    res
      .status(201)
      .json({ statusCode: "00", message: "Data successfully", data: da });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

// master
router.post("/contest-tanding", authMiddleware, async (req, res) => {
  const { name, klass, event, count, biru, merah } = req.body;

  let data,
    key,
    qey,
    timer,
    par,
    errors = [];

  try {
    qey = await getUniqueQey();
    timer = await getUniqueTimer();
    data = req.body;
    data = Object.assign(data, {
      qey: qey,
      timer: timer,
      type: "tanding",
      var : "tanding",
      jurus: 0,
    });

    if (!name) {
      errors.push("name is required");
    }

    if (!biru) {
      errors.push("biru is required");
    }

    if (!merah) {
      errors.push("merah is required");
    }

    if (!klass) {
      errors.push("klass is required");
    }

    if (!event) {
      errors.push("klass is required");
    }

    if (!count) {
      errors.push("count is required");
    }

    if (!Number.isInteger(count) || count < 0) {
      errors.push("Count must be number or greater than 0");
    }

    if (errors.length > 0) {
      throw new Error("error");
    }

    const contest = await Contest.create(data);

    for (let index = 1; index < count+1; index++) {
      key = await getUniqueKey();
      par = { name: "juri " + index, key: key, contestId: contest.id };
      await Qey.create(par);
    }

    await Side.create({ contestId: contest.id, name: biru, type: 1 });
    await Side.create({ contestId: contest.id, name: merah, type: 2 });
    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: data,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.post("/contest-seni", authMiddleware, async (req, res) => {
  const { name, klass, event, count, jurus, peserta, type } = req.body;

  let data,
    key,
    qey,
    timer,
    par,
    errors = [];

  try {
    qey = await getUniqueQey();
    timer = await getUniqueTimer();
    data = req.body;
    data = Object.assign(data, { qey: qey, timer: timer, type: "seni", var: type });

    if (!name) {
      errors.push("name is requird");
    }

    if (!type) {
      errors.push("type is requird");
    }

    if (!peserta) {
      errors.push("peserta is requird");
    }

    if (!klass) {
      errors.push("klass is requird");
    }

    if (!event) {
      errors.push("klass is requird");
    }

    if (!count) {
      errors.push("count is requird");
    }

    if (!jurus) {
      errors.push("jurus is requird");
    }

    if (!Number.isInteger(count) || count < 0) {
      errors.push("Count must be number or greater than 0");
    }

    if (!Number.isInteger(jurus) || jurus < 0) {
      errors.push("jurus must be number or greater than 0");
    }

    if (errors.length > 0) {
      throw new Error("error");
    }

    const contest = await Contest.create(data);

    for (let index = 1; index < jurus; index++) {
      console.log(contest.id);
      key = await getUniqueKey();
      par = { name: "juri " + index, key: key, contestId: contest.id };
      await Qey.create(par);
    }

    if (Array.isArray(peserta)) {
      for (let index = 0; index < peserta.length; index++) {
        await Side.create({
          contest: contest.id,
          name: peserta[index],
          type: 3,
        });
      }
    } else {
      await Side.create({ contest: contest.id, name: peserta, type: 3 });
    }

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: data,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
 
    const contest = await Contest.destroy({
      where : { id : id }
    });

    console.log(contest);

    if (!contest) {
      throw new Error("Invalid Code Access");
    }

    res.status(201).json({
      statusCode: "00",
      message: "Data delete successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

module.exports = router;
