const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize");
const {
  Contest,
  Art,
  Qey,
  Side,
  Timer,
  Summary,
  Value,
  viewArt,
  Kelas,
  Gelanggang,
  Peserta,
  Device,
  Liga,
  Head,
  Jon,
  Assign,
} = require("../model/dataModel");
const { getUniqueQey, getUniqueTimer, getUniqueKey } = require("../Helper");
const { where, INTEGER } = require("sequelize");
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
    res.status(401).json({ statusCode: "41", message: "Unauthorized" });
  }
};

router.post("/art", authMiddleware, async (req, res) => {
  const { code, val, type, power } = req.body;
  let art, end, beginPoint;

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
      include: [{ model: Contest, as: "contest" }],
    });
    // dewan
    const contest = await Contest.findOne({
      where: { qey: code },
    });
    const vals = type === "press" ? val : 0.0;
    const powers = type === "power" ? val : 0.0;

    if (qey) {
      const beginPoint = JSON.parse(JSON.stringify(qey.contest.point, null, 2));

      if (type === "press") {
        art = await Art.create({
          contestId: qey.contestId,
          code: code,
          val: vals,
          power: powers,
          type: type,
        });
      } else {
        art = await Art.findOne({
          where: { code: code, contestId: qey.contestId, type: type },
        });

        if (art) {
          art.val = vals;
          art.power = powers;
          await art.save();
        } else {
          art = await Art.create({
            contestId: qey.contestId,
            code: code,
            val: vals,
            power: powers,
            type: type,
          });
        }
      }

      point = await Art.sum("val", {
        where: { code: code, type: "press" },
      });

      console.log(point);

      end = beginPoint - point;
      end = end.toFixed(2);

      // point = await viewArt.findAll({
      //   attributes: ["points", "total"],
      //   where: { code: art.code },
      //   where: { con: art.con },
      // });

      // point = JSON.parse(JSON.stringify(point, null, 2));
      // end = point[0].points;
    } else if (contest) {
      art = await Art.findOne({
        where: { code: code },
        where: { type: type },
      });

      console.log(art);

      if (art) {
        art.val = val;
        art.power = powers;
        await art.save();
      } else {
        art = await Art.create({
          contestId: contest.id,
          code: code,
          val: val,
          power: powers,
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
      data: end,
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
          attributes: ["name", "key"],
        },
        {
          model: Side,
          as: "sides",
          attributes: ["name", "id"],
        },
      ],
    });
    res.status(200).json({
      statusCode: "00",
      data: data,
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

      contest.move = status == "start" ? 1 : 0;
      await contest.save();
    } else {
      throw new Error("Invalid Code Access");
    }

    timer = await Timer.findAll({
      where: { key: code },
      where: { status: "start" },
    });

    console.log(timer);

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
  let contest,
    juri,
    ass,
    peserta = [];

  try {
    if (!code) {
      throw new Error("Code is required");
    }

    contest = await Contest.findOne({
      where: { qey: code },
      include: [{ model: Side, as: "sides" }],
    });
    ass = "dewan";

    if (!contest) {
      contest = await Contest.findOne({
        where: { timer: code },
        include: [{ model: Side, as: "sides" }],
      });
      ass = "timer";
    }

    if (!contest) {
      juri = await Qey.findOne({
        where: { key: code },
        include: [
          {
            model: Contest,
            as: "contest",

            include: [{ model: Side, as: "sides" }],
          },
        ],
      });

      if (!juri) {
        throw new Error("Invalid Code Access");
      }
      peserta = JSON.parse(JSON.stringify(juri.contest.sides, null, 2));
    } else {
      peserta = JSON.parse(JSON.stringify(contest.sides, null, 2));
    }

    da = {
      id: contest ? contest.id : juri.contest.id,
      key: code,
      contest: contest ? contest.name : juri.contest.name,
      status: contest ? contest.status : juri.contest.status,
      point: contest ? contest.point : juri.contest.point,
      jurus: contest ? contest.jurus : juri.contest.jurus,
      move: contest ? contest.move : juri.contest.move,
      ver: contest ? contest.ver : juri.contest.ver,
      type: contest ? contest.type : juri.contest.type,
      name: contest ? ass : juri.name,
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
      var: "tanding",
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

    for (let index = 1; index < count + 1; index++) {
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
    point,
    errors = [];

  try {
    const tipe = ["tunggal", "regu", "solo"];
    if (tipe.includes(type)) {
      point = 9.9;
    } else {
      point = 9.1;
    }

    qey = await getUniqueQey();
    timer = await getUniqueTimer();
    data = req.body;
    data = Object.assign(data, {
      qey: qey,
      timer: timer,
      type: "seni",
      var: type,
      point: point,
    });

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
          contestId: contest.id,
          name: peserta[index],
          type: 3,
        });
      }
    } else {
      await Side.create({ contestId: contest.id, name: peserta, type: 3 });
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
      where: { id: id },
    });

    await Qey.destroy({
      where: { contestId: id },
    });

    await Side.destroy({
      where: { contestId: id },
    });

    await Art.destroy({
      where: { contestId: id },
    });

    await Timer.destroy({
      where: { contestId: id },
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

// kelas
router.post("/kelas", authMiddleware, async (req, res) => {
  let errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  try {
    const { name } = req.body;

    if (!name) {
      errors.push("name is required");
    }

    await Kelas.create({ name: name });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: req.body,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/kelas", authMiddleware, async (req, res) => {
  const kelas = await Kelas.findAll();
  res.status(201).json({
    statusCode: "00",
    message: "Data inserted successfully",
    data: kelas,
  });
});

router.delete("/kelas/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Kelas.destroy({
      where: { id: id },
    });
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

router.put("/kelas/:id", authMiddleware, async (req, res) => {
  let errors = [];
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
    if (!name) {
      errors.push("name is required");
    }

    const kelas = await Kelas.findOne({ where: { id: id } });
    kelas.name = name;
    await kelas.save();

    res.status(201).json({
      statusCode: "00",
      message: "Data Update successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

// gelanggang

router.post("/gelanggang", authMiddleware, async (req, res) => {
  let errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  try {
    const { name } = req.body;

    if (!name) {
      errors.push("name is required");
    }

    await Gelanggang.create({ name: name });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: req.body,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/gelanggang", authMiddleware, async (req, res) => {
  const item = await Gelanggang.findAll();
  res.status(201).json({
    statusCode: "00",
    message: "Data inserted successfully",
    data: item,
  });
});

router.delete("/gelanggang/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Gelanggang.destroy({
      where: { id: id },
    });
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

router.put("/gelanggang/:id", authMiddleware, async (req, res) => {
  let errors = [];
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
    if (!name) {
      errors.push("name is required");
    }

    const item = await Gelanggang.findOne({ where: { id: id } });
    item.name = name;
    await item.save();

    res.status(201).json({
      statusCode: "00",
      message: "Data Update successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

// peserta
router.post("/peserta", authMiddleware, async (req, res) => {
  let errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  try {
    const { name, bb, gender, kontingen } = req.body;

    if (!name) {
      errors.push("name is required");
    }

    await Peserta.create({
      name: name,
      bb: bb,
      gender: gender,
      kontingen: kontingen,
    });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: req.body,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/peserta", authMiddleware, async (req, res) => {
  const item = await Peserta.findAll({
    attributes: [
      [Sequelize.col("name"), "label"],
      [Sequelize.col("id"), "value"],
      "bb",
      "kontingen",
    ],
  });
  res.status(201).json({
    statusCode: "00",
    message: "Data inserted successfully",
    data: item,
  });
});

router.delete("/peserta/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Peserta.destroy({
      where: { id: id },
    });
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

router.put("/peserta/:id", authMiddleware, async (req, res) => {
  let errors = [];
  const id = parseInt(req.params.id);
  const { name, bb, gender, kontingen } = req.body;
  try {
    if (!name) {
      errors.push("name is required");
    }

    const item = await Peserta.findOne({ where: { id: id } });
    item.name = name;
    item.bb = bb;
    item.gender = gender;
    item.kontingen = kontingen;
    await item.save();

    res.status(201).json({
      statusCode: "00",
      message: "Data Update successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

//device
router.post("/device", authMiddleware, async (req, res) => {
  let errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  try {
    const { name, kode } = req.body;

    if (!name) {
      errors.push("name is required");
    }

    if (!kode) {
      errors.push("name is required");
    }

    await Device.create({ name: name, kode: kode });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: req.body,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/device", authMiddleware, async (req, res) => {
  const item = await Device.findAll();
  res.status(201).json({
    statusCode: "00",
    message: "Data inserted successfully",
    data: item,
  });
});

router.put("/device/:id", authMiddleware, async (req, res) => {
  let errors = [];
  const id = parseInt(req.params.id);
  const { name, kode } = req.body;
  try {
    if (!name) {
      errors.push("name is required");
    }

    const item = await Device.findOne({ where: { id: id } });
    item.name = name;
    item.kode = kode;
    await item.save();

    res.status(201).json({
      statusCode: "00",
      message: "Data Update successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

router.delete("/device/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Device.destroy({
      where: { id: id },
    });
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

//liga
router.post("/liga", authMiddleware, async (req, res) => {
  let errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  try {
    const { name } = req.body;

    if (!name) {
      errors.push("name is required");
    }

    await Liga.create({ name: name });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: req.body,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/liga", authMiddleware, async (req, res) => {
  const kelas = await Liga.findAll();
  res.status(201).json({
    statusCode: "00",
    message: "Data inserted successfully",
    data: kelas,
  });
});

router.delete("/liga/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Liga.destroy({
      where: { id: id },
    });
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

router.put("/liga/:id", authMiddleware, async (req, res) => {
  let errors = [];
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
    if (!name) {
      errors.push("name is required");
    }

    const item = await Liga.findOne({ where: { id: id } });
    item.name = name;
    await item.save();

    res.status(201).json({
      statusCode: "00",
      message: "Data Update successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: "05",
      message: error.message,
    });
  }
});

// head
router.post("/head", authMiddleware, async (req, res) => {
  let head,
    errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  const { kelas, red, blue, liga } = req.body;
  try {
    head = await Head.create({
      kelasId: kelas,
      ligaId: liga,
    });

    head = await head.save();

    const base = head.id;

    blue.map(async (item) => {
      await Jon.create({
        HeadId: base,
        peserta: item.value,
        sudut: 1,
      });
    });

    red.map(async (item) => {
      await Jon.create({
        HeadId: base,
        peserta: item.value,
        sudut: 2,
      });
    });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: head,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/head", authMiddleware, async (req, res) => {
  const kelas = await Head.findAll({
    attributes: ["id"],
    include: [
      {
        attributes: ["id", "peserta", "sudut"],
        model: Jon,
        as: "join",
        include: [{ model: Peserta, as: "user", attributes: ["name"] }],
      },
      {
        attributes: ["id", "name"],
        model: Liga,
        as: "liga",
      },
      {
        attributes: ["id", "name"],
        model: Kelas,
        as: "kelas",
      },
    ],
  });
  res.status(201).json({
    statusCode: "00",
    message: "Data successfully",
    data: kelas,
  });
});

router.put("/head/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { kelas, blue, red } = req.body;

  const item = await Head.findOne({ where: { id: id } });

  item.kelasId = kelas;
  await item.save();  
  const base = item.id;  
  await Jon.destroy({where : { HeadId : item.id }});
  blue.map(async (item) => {
    await Jon.create({
      HeadId: base,
      peserta: item.value,
      sudut: 1,
    });
  });

  red.map(async (item) => {
    await Jon.create({
      HeadId: base,
      peserta: item.value,
      sudut: 2,
    });
  });

  res.status(201).json({
    statusCode: "00",
    message: "Data successfully",
    data: item,
  });
});

//assign
router.post("/assign", authMiddleware, async (req, res) => {
  let head,
    errors = [];

  if (!req.body) {
    errors.push("data is required");
  }

  const { liga, red, blue } = req.body;
  try {
    const assign = await Assign.destroy({
      where: {
        ligaId: liga,
      },
    });

    blue.map(async (item) => {
      await Assign.create({
        ligaId: liga,
        pesertaId: item.value,
        corn: 1,
      });
    });

    red.map(async (item) => {
      await Assign.create({
        ligaId: liga,
        pesertaId: item.value,
        corn: 2,
      });
    });

    res.status(201).json({
      statusCode: "00",
      message: "Data inserted successfully",
      data: head,
    });
  } catch (error) {
    res.status(errors.length > 0 ? 400 : 500).json({
      statusCode: errors.length > 0 ? "04" : "05",
      message: "Failed",
      data: errors.length > 0 ? errors : error.message,
    });
  }
});

router.get("/assign/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const assign = await Assign.findAll({
    where: { ligaId: id },
    attributes: ["id", "corn"],
    include: [
      {
        attributes: ["id", "name"],
        model: Liga,
        as: "liga",
      },
      {
        attributes: ["id", "name"],
        model: Peserta,
        as: "peserta",
      },
    ],
  });

  const blue = assign
    .filter((b) => b.corn == 1)
    .map((item) => ({ value: item.peserta.id, label: item.peserta.name }));

  const red = assign
    .filter((r) => r.corn == 2)
    .map((item) => ({ value: item.peserta.id, label: item.peserta.name }));

  const rest = { blue: blue, red: red };

  res.status(201).json({
    statusCode: "00",
    message: "Data successfully",
    data: rest,
  });
});

module.exports = router;
