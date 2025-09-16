import Joi from "joi";

export const validate = (schema) => (req, res, next) => {
  const toValidate = {
    body: req.body,
    params: req.params,
    query: req.query
  };
  const { error } = schema.validate(toValidate, { abortEarly: false, allowUnknown: true });
  if (error) {
    const details = error.details?.map(d => d.message) || ["Validation error"];
    return res.status(400).json({ message: "Validation failed", errors: details });
  }
  next();
};

export const schemas = {
  auth: {
    login: Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(128).required()
      }),
      params: Joi.object({}),
      query: Joi.object({})
    }),
    register: Joi.object({
      body: Joi.object({
        fullname: Joi.string().min(2).max(100).required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(128).required()
      }),
      params: Joi.object({}),
      query: Joi.object({})
    })
  },
  project: {
    create: Joi.object({
      body: Joi.object({
        projectName: Joi.string().required(),
        projectUrl: Joi.string().uri().required(),
        projectDescription: Joi.string().required(),
        categories: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
        technologies: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
        projectStatus: Joi.string().valid("PLANNING", "IN_PROGRESS", "COMPLETED").required()
      }),
      params: Joi.object({}),
      query: Joi.object({})
    }),
    update: Joi.object({
      body: Joi.object({
        projectName: Joi.string(),
        projectUrl: Joi.string().uri(),
        sampleImage: Joi.string().uri(),
        projectDescription: Joi.string(),
        categories: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
        technologies: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
        projectStatus: Joi.string().valid("PLANNING", "IN_PROGRESS", "COMPLETED")
      }),
      params: Joi.object({ projectId: Joi.string().hex().length(24).required() }),
      query: Joi.object({})
    }),
    like: Joi.object({
      body: Joi.object({}),
      params: Joi.object({ projectId: Joi.string().hex().length(24).required() }),
      query: Joi.object({})
    }),
    addComment: Joi.object({
      body: Joi.object({ message: Joi.string().min(1).max(1000).required() }),
      params: Joi.object({ projectId: Joi.string().hex().length(24).required() }),
      query: Joi.object({})
    }),
    deleteComment: Joi.object({
      body: Joi.object({}),
      params: Joi.object({ projectId: Joi.string().hex().length(24).required(), commentId: Joi.string().hex().length(24).required() }),
      query: Joi.object({})
    })
  },
  message: {
    send: Joi.object({
      body: Joi.object({
          name: Joi.string().min(2).max(100).required(),
          email: Joi.string().email().required(),
          subject: Joi.string().min(2).max(200).allow(""),
          message: Joi.string().min(1).max(2000).required()
      }),
      params: Joi.object({}),
      query: Joi.object({})
    })
  },
  testimonial: {
    create: Joi.object({
      body: Joi.object({
        clientName: Joi.string().min(2).max(100).required(),
        clientRole: Joi.string().min(2).max(100).required(),
        project: Joi.string().min(2).max(200).required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        message: Joi.string().min(2).max(1000).required()
      }),
      params: Joi.object({}),
      query: Joi.object({})
    }),
    addComment: Joi.object({
      body: Joi.object({ message: Joi.string().min(1).max(1000).required() }),
      params: Joi.object({ testimonialId: Joi.string().hex().length(24).required() }),
      query: Joi.object({})
    }),
    deleteComment: Joi.object({
      body: Joi.object({}),
      params: Joi.object({ testimonialId: Joi.string().hex().length(24).required(), commentId: Joi.string().hex().length(24).required() }),
      query: Joi.object({})
    })
  }
};


