import { Express } from 'express';
import {
  validateAddWorkdaysRequest,
  validateGetConfigRequest,
  validateIsWorkdayRequest,
  validatePutConfigRequest,
} from '../validation/validators';
import { holidays as nl } from '../lib/zones/nl';
import { holidays as be } from '../lib/zones/be';
import ZoneNotFoundError from '../errors/ZoneNotFoundError';
import Workdays from '../Workdays';
import Config from '../Config';

const registerRoutes = (app: Express, workdays: Workdays, config: Config) => {
  /**
   * @openapi
   * /v1/:ref/isWorkday/:date:
   *   get:
   *     description: Returns whether the given date is a workday or not
   *     parameters:
   *        - in: path
   *          name: :ref
   *          schema:
   *              type: string
   *          required: true
   *          description: Ref of the config
   *        - in: path
   *          name: :date
   *          schema:
   *              type: string
   *          required: true
   *          description: Date to check
   *     responses:
   *       200:
   *         content:
   *            application/json:
   *                schema:
   *                    type: object
   *                    properties:
   *                      status:
   *                        type: string
   *                        description: Whether the call was successful or not
   *                        example: "SUCCESS"
   *                      result:
   *                        type: boolean
   *                        description: True if it is a workday, false if not
   */
  app.get('/v1/:ref/isWorkday/:date', async (req, res, next): Promise<void> => {
    try {
      const { ref, date } = await validateIsWorkdayRequest(req.params);

      res.json({
        status: 'SUCCESS',
        result: workdays.isWorkday(ref, date),
      });
    } catch (e) {
      next(e);
    }
  });

  /**
   * @openapi
   * /v1/:ref/addWorkdays/:date/:add:
   *   get:
   *     description: Returns the date after the given number of workdays have passed
   *     parameters:
   *        - in: path
   *          name: :ref
   *          schema:
   *              type: string
   *          required: true
   *          description: Ref of the config
   *        - in: path
   *          name: :date
   *          schema:
   *              type: string
   *          required: true
   *          description: Date to start from
   *        - in: path
   *          name: :add
   *          schema:
   *              type: number
   *          required: true
   *          description: Amount of days to add
   *     responses:
   *       200:
   *         content:
   *            application/json:
   *                schema:
   *                    type: object
   *                    properties:
   *                      status:
   *                        type: string
   *                        description: Whether the call was successful or not
   *                        example: "SUCCESS"
   *                      result:
   *                        type: string
   *                        description: The date of the workday after the given number of days
   *                        example: "2022-02-02"
   */
  app.get('/v1/:ref/addWorkdays/:date/:add', async (req, res, next): Promise<void> => {
    try {
      const { ref, date, add } = await validateAddWorkdaysRequest(req.params);

      res.json({
        status: 'SUCCESS',
        result: workdays.getWorkday(ref, date, add),
      });
    } catch (e) {
      next(e);
    }
  });

  /**
   * @openapi
   * /v1/:ref/config:
   *   get:
   *       description: Returns the config for the given ref
   *       parameters:
   *          - in: path
   *            name: :ref
   *            schema:
   *                type: string
   *            required: true
   *            description: Ref of the config
   *       responses:
   *         200:
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   status:
   *                     type: string
   *                     description: If the call was successful or not
   *                     example: "SUCCESS"
   *                   result:
   *                     type: object
   *                     properties:
   *                       zone:
   *                         type: string
   *                         description: Zone for the configuration
   *                       workdays:
   *                         type: array
   *                         description: The days that are worked in a week.
   *                         items:
   *                           type: string
   *                         example: [1,2,3,4,5]
   *                       numberOfYears:
   *                         type: number
   *                         description: The number of years that the cache should be generated for
   *                         items:
   *                           type: number
   *                       exclude:
   *                         type: array
   *                         description: The extra days to exclude
   *                         items:
   *                           type: string
   *                           example: 2022-02-02
   *                       excludeHolidays:
   *                         type: array
   *                         description: Holidays that are not applicable for this configuration
   *                         items:
   *                           type: string
   *                           example: koningsdag
   */
  app.get('/v1/:ref/config', async (req, res, next): Promise<void> => {
    try {
      const { ref } = await validateGetConfigRequest(req.params);

      res.json({
        status: 'SUCCESS',
        result: config.get(ref),
      });
    } catch (e) {
      next(e);
    }
  });

  /**
   * @openapi
   * /v1/:ref/config:
   *   put:
   *     description: Update the config for the given ref
   *     parameters:
   *        - in: path
   *          name: :ref
   *          schema:
   *              type: string
   *          required: true
   *          description: Ref of the config
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *               type: object
   *               properties:
   *                   zone:
   *                     type: string
   *                     description: Zone for the configuration
   *                   workdays:
   *                     type: array
   *                     description: The days that are worked
   *                     items:
   *                       type: string
   *                   numberOfYears:
   *                     type: number
   *                     description: The number of years that the cache should be generated for
   *                     items:
   *                       type: number
   *                   exclude:
   *                     type: array
   *                     description: The extra days to exclude
   *                     items:
   *                       type: string
   *                   excludeHolidays:
   *                     type: array
   *                     description: Holidays that are not applicable for this configuration
   *                     items:
   *                       type: string
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   description: Whether the call was successful or not
   *                   example: "SUCCESS"
   *                 error:
   *                   type: string
   *                   description: Error message when request fails
   *                   example: "Config is read-only"
   */
  app.put('/v1/:ref/config', async (req, res, next): Promise<void> => {
    try {
      const { ref, body } = await validatePutConfigRequest({
        ref: req.params?.ref,
        body: req.body,
      });

      if (config.isWritable()) {
        // write the body to the config file
        config.write(ref, body);

        res.json({
          status: 'SUCCESS',
        });
      } else {
        res.json({
          status: 'FAILED',
          error: 'Config is read-only',
        });
      }
    } catch (e) {
      next(e);
    }
  });

  /**
   * @openapi
   * /v1/holidays/:zone:
   *   get:
   *       description: Returns a list of holidays for a given zone
   *       parameters:
   *          - in: path
   *            name: :zone
   *            schema:
   *                type: string
   *            required: true
   *            description: Zone to get the holidays from
   *       responses:
   *         200:
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   status:
   *                     type: string
   *                     description: If the call was successful or not
   *                     example: "SUCCESS"
   *                   result:
   *                     type: array
   *                     description: The holidays
   *                     items:
   *                        type: string
   */
  app.get('/v1/holidays/:zone', async (req, res, next): Promise<void> => {
    try {
      let holidays = [];
      switch (req.params?.zone) {
        case 'nl':
          holidays = nl;
          break;
        case 'be':
          holidays = be;
          break;
        default:
          throw new ZoneNotFoundError(`Zone ${req.params?.zone} not found`);
      }

      res.json({
        status: 'SUCCESS',
        result: holidays,
      });
    } catch (e) {
      next(e);
    }
  });
};

export default registerRoutes;
