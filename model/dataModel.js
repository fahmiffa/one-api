const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Peserta = sequelize.define(
  "peserta",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    kontingen: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    bb: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "peserta",
    timestamps: true,
    underscored: true,
  }
);

const Kelas = sequelize.define(
  "Kelas",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "kelas",
    timestamps: true,
    underscored: true,
  }
);

const Gelanggang = sequelize.define(
  "gelanggang",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "gelanggang",
    timestamps: true,
    underscored: true,
  }
);

const Level = sequelize.define(
  "level",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "level",
    timestamps: true,
    underscored: true,
  }
);

const Liga = sequelize.define(
  "league",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "league",
    timestamps: true,
    underscored: true,
  }
);

const Device = sequelize.define(
  "device",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    kode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "device",
    timestamps: true,
    underscored: true,
  }
);

const Jon = sequelize.define(
  "join",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    HeadId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    peserta: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    sudut: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "join",
    timestamps: true,
    underscored: true,
  }
);

Jon.belongsTo(Peserta, { foreignKey: "peserta", as: "user" });

const Head = sequelize.define(
  "head",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ligaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kelasId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "head",
    timestamps: true,
    underscored: true,
  }
);

Head.hasMany(Jon, {
  foreignKey: "HeadId",
  as: "join",
});
Head.belongsTo(Liga, {
  foreignKey: "ligaId",
  as: "liga",
});
Head.belongsTo(Kelas, {
  foreignKey: "kelasId",
  as: "kelas",
});


const Assign = sequelize.define(
  "assign",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ligaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pesertaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    corn: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "assign",
    timestamps: true,
    underscored: true,
  }
);

Assign.belongsTo(Liga, {
  foreignKey : "ligaId",
  as : "liga"
});

Assign.belongsTo(Peserta, {
  foreignKey : "pesertaId",
  as : "peserta"
});

const Match = sequelize.define(
  "match",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ligaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nomor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    event: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    jurus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    timer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    point: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "match",
    timestamps: true,
    underscored: true,
  }
);

const Contest = sequelize.define(
  "Contest",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    var: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    klass: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    event: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    qey: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    timer: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jurus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    move: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    point: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "contests",
    timestamps: true,
    underscored: true,
  }
);

const Art = sequelize.define(
  "Art",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    val: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    wan: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    power: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "art",
    timestamps: true,
    underscored: true,
  }
);

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rememberToken: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

const Qey = sequelize.define(
  "Qey",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    api: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "qeys",
    timestamps: true,
    underscored: true,
  }
);

const Side = sequelize.define(
  "Side",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "sides",
    timestamps: true,
    underscored: true,
  }
);

const Timer = sequelize.define(
  "Timer",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    time: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "timer",
    timestamps: true,
    underscored: true,
  }
);

const Summary = sequelize.define(
  "Summary",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    side: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    val: {
      type: DataTypes.BIGINT.UNSIGNED,
      defaultValue: 0,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      collate: "utf8mb4_unicode_ci",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_at",
    },
  },
  {
    tableName: "summary",
    timestamps: true,
    underscored: true,
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  }
);

const Value = sequelize.define(
  "Value",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contestId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    point: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    side: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    up: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      collate: "utf8mb4_unicode_ci",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_at",
    },
  },
  {
    tableName: "values",
    timestamps: false,
    collate: "utf8mb4_unicode_ci",
    underscored: true,
  }
);

const viewArt = sequelize.define(
  "viewArt",
  {
    con: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "con",
    },
    CODE: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "CODE",
    },
    points: {
      type: DataTypes.DECIMAL(28, 2),
      allowNull: true,
      field: "points",
    },
    total: {
      type: DataTypes.DECIMAL(30, 2),
      allowNull: true,
      field: "total",
    },
  },
  {
    tableName: "view_art",
    timestamps: false,
    freezeTableName: true,
  }
);

Contest.hasMany(Side, {
  foreignKey: "contestId",
  as: "sides",
});

Side.belongsTo(Contest, {
  foreignKey: "contestId",
  as: "contest",
});

Contest.hasMany(Timer, {
  foreignKey: "contestId",
  as: "time",
});

Timer.belongsTo(Contest, {
  foreignKey: "contestId",
  as: "contest",
});

Contest.hasMany(Qey, {
  foreignKey: "contestId",
  as: "qeys",
});

Qey.belongsTo(Contest, {
  foreignKey: "contestId",
  as: "contest",
});

Contest.hasMany(Art, {
  foreignKey: "contestId",
  as: "arts",
});

Art.belongsTo(Contest, {
  foreignKey: "contestId",
  as: "contest",
});

module.exports = {
  Contest,
  Art,
  Qey,
  Side,
  Timer,
  Summary,
  Value,
  viewArt,
  // new
  Kelas,
  Gelanggang,
  Peserta,
  Level,
  Device,
  Head,
  Liga,
  Jon,
  Assign,
  Match
};
