import Tarea from "../modelos/Tarea.js";
import Proyecto from "../modelos/Proyecto.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("Ese proyecto no existe en base de datos");
    return res.status(404).json({ msg: error.message });
  }

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(403).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);

    // Almacenar el id en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);

    await existeProyecto.save();

    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para acceder a esta tarea");
    return res.status(403).json({ msg: error.message });
  }
  try {
    res.json(tarea);
  } catch (error) {
    console.log(error);
  }
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para acceder a esta tarea");
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;

  try {
    const tareaActualizada = await tarea.save();
    res.json(tareaActualizada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para acceder a esta tarea");
    return res.status(403).json({ msg: error.message });
  }

  try {
    await Tarea.deleteOne();

    res.json({ msg: "La tarea ha sido eliminada" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({ msg: error.message });
  }
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("No tienes los permisos para acceder a esta tarea");
    return res.status(403).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  await tarea.save();

  res.json(tarea);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
