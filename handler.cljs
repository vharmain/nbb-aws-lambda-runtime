(ns script)

(defn handler [event ctx callback]
  (js/console.log event)
  (callback nil #js{:hello "world"}))

#js {:handler handler}


