import { GetDashboardStatsUseCase } from './get-dashboard-stats.usecase';
import { DashboardStats } from '../../domain/dashboard/dashboard-stats.repository';

const emptyStats: DashboardStats = {
  totalEvents: 0,
  totalCapacity: 0,
  totalRegistered: 0,
  totalCheckIns: 0,
  eventsByStatus: { DRAFT: 0, PUBLISHED: 0, CLOSED: 0, CANCELLED: 0 },
  eventsByCategory: {
    CONFERENCE: 0,
    WORKSHOP: 0,
    MEETUP: 0,
    HACKATHON: 0,
    WEBINAR: 0,
    TRAINING: 0,
    OTHER: 0,
  },
};

describe('GetDashboardStatsUseCase', () => {
  it('delegates to the repository with the given organizer id', async () => {
    const stats: DashboardStats = { ...emptyStats, totalEvents: 3 };
    const getStats = jest.fn().mockResolvedValue(stats);
    const useCase = new GetDashboardStatsUseCase({ getStats });

    const result = await useCase.execute({ organizerId: 'organizer-1' });

    expect(getStats).toHaveBeenCalledWith('organizer-1');
    expect(result).toBe(stats);
  });
});
