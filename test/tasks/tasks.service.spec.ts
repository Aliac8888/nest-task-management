import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../src/tasks/task.entity';
import { TasksService } from '../../src/tasks/tasks.service';
import { TaskStatus } from '../../src/tasks/task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  username: 'test',
  id: 'id-1',
  password: 'password1234',
  tasks: [],
};

const mockedTask = {
  title: 'Test Title',
  description: 'Test Desc',
  id: 'someId',
  status: TaskStatus.OPEN,
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue('someTasks'), // or a mock array of tasks
};

const mockTasksRepository = {
  getTasks: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('TasksService', () => {
  let tasksService: TasksService;

  beforeEach(async () => {
    // initialize a Nestjs module with tasksService and tasksRepository
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task), // Token for the Task repository
          useValue: mockTasksRepository, // Provide the mock implementation
        },
      ],
    }).compile();

    tasksService = module.get(TasksService);
  });

  describe('getTasks', () => {
    it('calls TasksService.getTasks and returns the result', async () => {
      const result = await tasksService.getTasks({}, mockUser);

      expect(mockTasksRepository.createQueryBuilder).toHaveBeenCalledWith(
        'task',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual('someTasks');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksService.findOne and returns the result', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockedTask);
      const result = await tasksService.getTaskById('someId', mockUser);
      expect(result).toEqual(mockedTask);
    });

    it('calls TasksService.findOne and handles the error', () => {
      mockTasksRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById('someId', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
