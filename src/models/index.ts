// Export all models from a single file for easier imports

import TeamModel, { ITeam } from './team.model';
import TeamPlayerModel, { ITeamPlayer, PlayerRole } from './team-player.model';
import MatchModel, { IMatch, MatchStatus, InningsStatus } from './match.model';
import PlayerModel, { IPlayer, BattingStyle, BowlingStyle } from './player.model';
import UniversityModel, { IUniversity } from './university.model';
import MatchPlayerStatsModel, {
    IMatchPlayerStats,
    PerformanceType,
    IBattingStats,
    IBowlingStats,
    IFieldingStats
} from './match-player-stats.model';
import MatchBallByBallModel, {
    IMatchBallByBall,
    BallOutcome
} from './match-ball-by-ball.model';

export {
    // Models
    TeamModel,
    TeamPlayerModel,
    MatchModel,
    PlayerModel,
    UniversityModel,
    MatchPlayerStatsModel,
    MatchBallByBallModel,

    // Interfaces
    ITeam,
    ITeamPlayer,
    IMatch,
    IPlayer,
    IUniversity,
    IMatchPlayerStats,
    IBattingStats,
    IBowlingStats,
    IFieldingStats,
    IMatchBallByBall,

    // Enums
    PlayerRole,
    MatchStatus,
    InningsStatus,
    BattingStyle,
    BowlingStyle,
    PerformanceType,
    BallOutcome
};