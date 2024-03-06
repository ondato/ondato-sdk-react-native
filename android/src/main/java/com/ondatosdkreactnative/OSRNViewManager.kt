package com.ondatosdkreactnative

import android.util.Log
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModelProvider
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.google.gson.Gson

class OSRNViewManager(var reactContext: ReactApplicationContext) :
  ViewGroupManager<FrameLayout?>() {
  private var viewModel: OSRNModel? = null
  private var viewId: Int? = null
  private var propWidth: Int? = null
  private var propHeight: Int? = null

  override fun getName() = REACT_CLASS

  /**
   * Return a FrameLayout which will later hold the Fragment
   */
  public override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
    val activity = reactContext.currentActivity as FragmentActivity

    viewModel = ViewModelProvider(activity).get(OSRNModel::class.java)
    viewModel!!.setReactContext(reactContext)

    return FrameLayout(reactContext)
  }

  /**
   * Map the "create" command to an integer
   */
  override fun getCommandsMap() = mapOf("create" to COMMAND_CREATE, "test" to COMMAND_TEST)

  /**
   * Handle "create" command (called from JS) and call createFragment method
   */
  override fun receiveCommand(
    root: FrameLayout,
    commandId: String,
    args: ReadableArray?
  ) {
    super.receiveCommand(root, commandId, args)
    val reactNativeViewId = requireNotNull(args).getInt(0)

    when (commandId.toInt()) {
      COMMAND_CREATE -> createFragment(root, reactNativeViewId)
      COMMAND_TEST -> Log.d("TEST", "Testing out 'test' command")
    }
  }

  /**
   * Replace your React Native view with a custom fragment
   */
  private fun createFragment(root: FrameLayout, reactNativeViewId: Int) {
    val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
    setupLayout(parentView)

    val myFragment = OSRNFragment()
    val activity = reactContext.currentActivity as FragmentActivity
    activity.supportFragmentManager
      .beginTransaction()
      .replace(reactNativeViewId, myFragment, reactNativeViewId.toString())
      .commit()
    viewId = myFragment.id
  }

  private fun setupLayout(view: View) {
    Choreographer.getInstance().postFrameCallback(object : Choreographer.FrameCallback {
      override fun doFrame(frameTimeNanos: Long) {
        manuallyLayout(view)
        view.viewTreeObserver.dispatchOnGlobalLayout()
        Choreographer.getInstance().postFrameCallback(this)
      }
    })
  }

  /**
   * Layout all children properly
   */
  private fun manuallyLayout(view: View) {
    // propWidth and propHeight coming from react-native props
    val width = requireNotNull(propWidth)
    val height = requireNotNull(propHeight)

    // https://developer.android.com/reference/android/view/View.MeasureSpec
    view.measure(
      View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
      View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
    )

    view.layout(0, 0, width, height)
  }

  @ReactPropGroup(names = ["width", "height"], customType = "Style")
  fun setStyle(view: FrameLayout, index: Int, value: Int) {
    if (index == 0) propWidth = value
    if (index == 1) propHeight = value
  }

  @ReactProp(name = "configuration")
  fun setConfiguration(view: View, configuration: String) {
    val gson = Gson()
    val conf: OSRNConfiguration = gson.fromJson(configuration, OSRNConfiguration::class.java)
    viewModel?.setConfiguration(conf)
  }

  companion object {
    const val COMMAND_CREATE = 1
    const val COMMAND_TEST = 2
    const val REACT_CLASS = "OSRNViewManager"
  }
}
