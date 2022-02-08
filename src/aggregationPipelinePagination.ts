import { FilterQuery } from 'mongoose';

export const paginationPipeLine = <T extends Record<string, any>>(page = '1', filter: FilterQuery<T> = {}) => {
  const limit = 5;
  const skip = (Number(page) - 1) * limit;

  return <any>[
    {
      $match: {
        ...filter,
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },

    {
      $facet: {
        total: [
          {
            $count: 'count',
          },
        ],
        data: [
          {
            $addFields: {
              _id: '$_id',
            },
          },
        ],
      },
    },
    {
      $unwind: '$total',
    },

    {
      $project: {
        items: {
          $slice: [
            '$data',
            skip,
            {
              $ifNull: [limit, '$total.count'],
            },
          ],
        },
        page: {
          $literal: skip / limit + 1,
        },
        hasNextPage: {
          $lt: [{ $multiply: [limit, Number(page)] }, '$total.count'],
        },
        totalPages: {
          $ceil: {
            $divide: ['$total.count', limit],
          },
        },
        totalItems: '$total.count',
      },
    },
  ] ;
};